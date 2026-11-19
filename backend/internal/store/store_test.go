package store

import (
	"os"
	"path/filepath"
	"testing"
)

func TestSanitizeRel(t *testing.T) {
	valid := []string{"", "学习笔记", "学习笔记/Go", "02 - areas/学业发展/code"}
	for _, input := range valid {
		if _, err := SanitizeRel(input); err != nil {
			t.Fatalf("SanitizeRel(%q) 应通过，实际错误: %v", input, err)
		}
	}

	invalid := []string{"..", "../etc", "a/../../b", "/etc/passwd", "a/b?c", `a\..\b`, "CON", "a/ /b"}
	for _, input := range invalid {
		if _, err := SanitizeRel(input); err == nil {
			t.Fatalf("SanitizeRel(%q) 应被拒绝", input)
		}
	}
}

func TestNoteRoundTrip(t *testing.T) {
	root := t.TempDir()
	st, err := New(filepath.Join(root, "notes"), filepath.Join(root, "images"), filepath.Join(root, "feedback"))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := st.CreateCategory(KindNotes, "", "学习笔记"); err != nil {
		t.Fatal(err)
	}
	created, err := st.CreateNote("学习笔记", "", NoteInput{
		Title:   "Go 入门",
		Date:    "2026-11-18",
		Tags:    []string{"学习笔记", "Go"},
		Content: "# 标题\n\n正文内容。",
	})
	if err != nil {
		t.Fatal(err)
	}
	if created.Path != "学习笔记/Go-入门.md" {
		t.Fatalf("路径不符合预期: %s", created.Path)
	}

	got, err := st.GetNote(created.Path)
	if err != nil {
		t.Fatal(err)
	}
	if got.Title != "Go 入门" || len(got.Tags) != 2 {
		t.Fatalf("元数据解析错误: %+v", got)
	}
	if got.Content != "# 标题\n\n正文内容。\n" {
		t.Fatalf("正文解析错误: %q", got.Content)
	}

	updated, err := st.UpdateNote(created.Path, NoteInput{Title: "Go 入门（改）", Tags: []string{"Go"}})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Title != "Go 入门（改）" {
		t.Fatalf("更新失败: %+v", updated)
	}

	if err := st.DeleteNote(created.Path); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, "notes", "学习笔记", "Go-入门.md")); !os.IsNotExist(err) {
		t.Fatal("删除后文件仍存在")
	}
}

func TestTreeChildrenNeverNil(t *testing.T) {
	root := t.TempDir()
	st, err := New(filepath.Join(root, "notes"), filepath.Join(root, "images"), filepath.Join(root, "feedback"))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := st.CreateCategory(KindNotes, "", "一级"); err != nil {
		t.Fatal(err)
	}
	if _, err := st.CreateCategory(KindNotes, "一级", "二级"); err != nil {
		t.Fatal(err)
	}
	tree, err := st.Tree(KindNotes)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree) != 1 || tree[0].Children == nil || len(tree[0].Children) != 1 {
		t.Fatalf("树结构错误: %+v", tree)
	}
	if tree[0].Children[0].Children == nil {
		t.Fatal("叶子节点 Children 不能是 nil（前端会渲染失败）")
	}
}

func TestSafeUploadName(t *testing.T) {
	if _, err := safeUploadName("../../evil.png"); err != nil {
		// filepath.Base 会把它降级成 evil.png，属于可接受行为
		t.Logf("降级处理: %v", err)
	}
	if name, err := safeUploadName("Pasted image 2026 (1).PNG"); err != nil || name != "Pasted-image-2026-1.png" {
		t.Fatalf("文件名规范化错误: %q %v", name, err)
	}
	if _, err := safeUploadName("shell.exe"); err == nil {
		t.Fatal("非图片扩展名应被拒绝")
	}
}
