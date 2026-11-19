package store

import (
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

var allowedImageExt = map[string]bool{
	".png": true, ".jpg": true, ".jpeg": true, ".gif": true,
	".webp": true, ".svg": true, ".bmp": true, ".avif": true,
}

type Image struct {
	Name    string    `json:"name"`
	Path    string    `json:"path"`
	URL     string    `json:"url"`
	Size    int64     `json:"size"`
	ModTime time.Time `json:"modTime"`
}

func (s *Store) ListImages(category string) ([]Image, error) {
	dir, err := s.resolve(KindImages, category)
	if err != nil {
		return nil, err
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, ErrNotFound
	}
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name() > entries[j].Name() })

	images := make([]Image, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		ext := strings.ToLower(filepath.Ext(entry.Name()))
		if !allowedImageExt[ext] {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		rel := path.Join(category, entry.Name())
		images = append(images, Image{
			Name:    entry.Name(),
			Path:    rel,
			URL:     mediaURL(rel),
			Size:    info.Size(),
			ModTime: info.ModTime(),
		})
	}
	return images, nil
}

func (s *Store) SaveImages(category string, files []*multipart.FileHeader) ([]Image, error) {
	dir, err := s.resolve(KindImages, category)
	if err != nil {
		return nil, err
	}
	if info, err := os.Stat(dir); err != nil || !info.IsDir() {
		return nil, ErrNotFound
	}

	saved := make([]Image, 0, len(files))
	for _, header := range files {
		name, err := safeUploadName(header.Filename)
		if err != nil {
			return saved, err
		}
		src, err := header.Open()
		if err != nil {
			return saved, err
		}
		head := make([]byte, 512)
		n, _ := io.ReadFull(src, head)
		if !looksLikeImage(head[:n]) {
			src.Close()
			return saved, errors.New("只允许上传图片：" + name)
		}
		if _, err := src.Seek(0, io.SeekStart); err != nil {
			src.Close()
			return saved, err
		}

		finalName := uniqueName(dir, name)
		full := filepath.Join(dir, finalName)
		dst, err := os.Create(full)
		if err != nil {
			src.Close()
			return saved, err
		}
		if _, err := io.Copy(dst, src); err != nil {
			dst.Close()
			src.Close()
			return saved, err
		}
		dst.Close()
		src.Close()

		info, _ := os.Stat(full)
		rel := path.Join(category, finalName)
		img := Image{Name: finalName, Path: rel, URL: mediaURL(rel), ModTime: time.Now()}
		if info != nil {
			img.Size = info.Size()
			img.ModTime = info.ModTime()
		}
		saved = append(saved, img)
	}
	return saved, nil
}

func (s *Store) DeleteImage(rel string) error {
	full, err := s.resolve(KindImages, rel)
	if err != nil {
		return err
	}
	if !allowedImageExt[strings.ToLower(filepath.Ext(full))] {
		return ErrInvalidPath
	}
	if err := os.Remove(full); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return ErrNotFound
		}
		return err
	}
	return nil
}

func mediaURL(rel string) string {
	u := url.URL{Path: "/uploads/" + rel}
	return u.EscapedPath()
}

func safeUploadName(name string) (string, error) {
	name = filepath.Base(strings.ReplaceAll(name, "\\", "/"))
	if name == "" || name == "." || name == ".." {
		return "", ErrInvalidPath
	}
	if strings.ContainsAny(name, `<>:"|?*`+"\x00") || strings.HasSuffix(name, " ") {
		return "", ErrInvalidPath
	}
	ext := strings.ToLower(filepath.Ext(name))
	if !allowedImageExt[ext] {
		return "", errors.New("不支持的图片格式：" + ext)
	}
	base := strings.TrimSuffix(name, filepath.Ext(name))
	base = Slugify(base)
	if base == "" {
		base = "image"
	}
	return base + ext, nil
}

func uniqueName(dir, name string) string {
	candidate := name
	ext := filepath.Ext(name)
	base := strings.TrimSuffix(name, ext)
	for i := 1; ; i++ {
		if _, err := os.Stat(filepath.Join(dir, candidate)); errors.Is(err, os.ErrNotExist) {
			return candidate
		}
		candidate = base + "-" + itoa(i) + ext
	}
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var b [8]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	return string(b[i:])
}

func looksLikeImage(head []byte) bool {
	if len(head) == 0 {
		return false
	}
	ct := http.DetectContentType(head)
	return strings.HasPrefix(ct, "image/") || strings.Contains(ct, "xml")
}
