package store

import (
	"path/filepath"
	"testing"
)

func TestFeedbackLifecycle(t *testing.T) {
	root := t.TempDir()
	st, err := New(filepath.Join(root, "notes"), filepath.Join(root, "images"), filepath.Join(root, "feedback"))
	if err != nil {
		t.Fatal(err)
	}

	if _, err := st.AddFeedback(FeedbackInput{Content: "   "}); err == nil {
		t.Fatal("空内容应被拒绝")
	}

	first, err := st.AddFeedback(FeedbackInput{Name: "小明", Contact: "a@b.com", Category: "建议", Content: "希望增加搜索"})
	if err != nil {
		t.Fatal(err)
	}
	if first.ID == "" || first.Category != "建议" {
		t.Fatalf("返回值异常: %+v", first)
	}

	if _, err := st.AddFeedback(FeedbackInput{Content: "第二条意见"}); err != nil {
		t.Fatal(err)
	}

	items, err := st.ListFeedback()
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 2 {
		t.Fatalf("期望 2 条，实际 %d", len(items))
	}
	if items[0].Content != "第二条意见" {
		t.Fatalf("应按时间倒序，首条是: %+v", items[0])
	}

	if err := st.DeleteFeedback(first.ID); err != nil {
		t.Fatal(err)
	}
	items, _ = st.ListFeedback()
	if len(items) != 1 {
		t.Fatalf("删除后应剩 1 条，实际 %d", len(items))
	}
}
