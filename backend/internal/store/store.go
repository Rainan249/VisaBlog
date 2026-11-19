package store

import (
	"errors"
	"os"
	"path"
	"path/filepath"
	"strings"
	"unicode"
)

const (
	KindNotes  = "notes"
	KindImages = "images"
)

var (
	ErrInvalidPath = errors.New("非法的路径")
	ErrNotFound    = errors.New("不存在")
	ErrExists      = errors.New("已存在")
	ErrNotEmpty    = errors.New("分类下还有内容")
)

type Store struct {
	NotesDir    string
	ImagesDir   string
	FeedbackDir string
}

func New(notesDir, imagesDir, feedbackDir string) (*Store, error) {
	for _, dir := range []string{notesDir, imagesDir, feedbackDir} {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, err
		}
	}
	return &Store{NotesDir: notesDir, ImagesDir: imagesDir, FeedbackDir: feedbackDir}, nil
}

func (s *Store) root(kind string) (string, error) {
	switch kind {
	case KindNotes:
		return s.NotesDir, nil
	case KindImages:
		return s.ImagesDir, nil
	default:
		return "", ErrInvalidPath
	}
}

// resolve 把「分类/文件名」转成绝对路径，并确保不会跳出根目录。
func (s *Store) resolve(kind, rel string) (string, error) {
	root, err := s.root(kind)
	if err != nil {
		return "", err
	}
	clean, err := SanitizeRel(rel)
	if err != nil {
		return "", err
	}
	full := filepath.Join(root, filepath.FromSlash(clean))

	rootAbs, err := filepath.Abs(root)
	if err != nil {
		return "", err
	}
	fullAbs, err := filepath.Abs(full)
	if err != nil {
		return "", err
	}
	if fullAbs != rootAbs && !strings.HasPrefix(fullAbs, rootAbs+string(os.PathSeparator)) {
		return "", ErrInvalidPath
	}
	return fullAbs, nil
}

// SanitizeRel 校验并规范化相对路径（统一用 / 分隔）。
func SanitizeRel(p string) (string, error) {
	p = strings.TrimSpace(strings.ReplaceAll(p, "\\", "/"))
	if strings.HasPrefix(p, "/") {
		return "", ErrInvalidPath
	}
	p = strings.Trim(p, "/")
	if p == "" {
		return "", nil
	}

	segments := strings.Split(p, "/")
	for _, seg := range segments {
		if seg == "" || seg == "." || seg == ".." {
			return "", ErrInvalidPath
		}
		if strings.ContainsAny(seg, `<>:"|?*`+"\x00") {
			return "", ErrInvalidPath
		}
		if strings.HasSuffix(seg, ".") || strings.HasSuffix(seg, " ") {
			return "", ErrInvalidPath
		}
		if isReservedWindowsName(seg) {
			return "", ErrInvalidPath
		}
	}
	return strings.Join(segments, "/"), nil
}

func isReservedWindowsName(seg string) bool {
	base := strings.ToUpper(strings.TrimSuffix(seg, path.Ext(seg)))
	switch base {
	case "CON", "PRN", "AUX", "NUL",
		"COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
		"LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9":
		return true
	}
	return false
}

// Slugify 保留中英文与数字，其余字符折叠为 -。
func Slugify(s string) string {
	s = strings.TrimSpace(s)
	var b strings.Builder
	dash := false
	for _, r := range s {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			b.WriteRune(r)
			dash = false
		case r == ' ' || r == '-' || r == '_' || r == '.':
			if !dash && b.Len() > 0 {
				b.WriteRune('-')
				dash = true
			}
		}
	}
	return strings.Trim(b.String(), "-")
}
