package store

import (
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

type Note struct {
	Path    string   `json:"path"`
	Name    string   `json:"name"`
	Title   string   `json:"title"`
	Date    string   `json:"date"`
	Tags    []string `json:"tags"`
	Slug    string   `json:"slug,omitempty"`
	Content string   `json:"content,omitempty"`
}

type NoteInput struct {
	Title   string   `json:"title"`
	Date    string   `json:"date"`
	Tags    []string `json:"tags"`
	Slug    string   `json:"slug"`
	Content string   `json:"content"`
}

type frontMatter struct {
	Title string   `yaml:"title"`
	Date  string   `yaml:"date"`
	Tags  []string `yaml:"tags,omitempty"`
	Slug  string   `yaml:"slug,omitempty"`
}

func (s *Store) ListNotes(category string) ([]Note, error) {
	dir, err := s.resolve(KindNotes, category)
	if err != nil {
		return nil, err
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, ErrNotFound
	}
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name() > entries[j].Name() })

	notes := make([]Note, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(strings.ToLower(entry.Name()), ".md") {
			continue
		}
		rel := path.Join(category, entry.Name())
		note, err := s.GetNote(rel)
		if err != nil {
			continue
		}
		note.Content = ""
		notes = append(notes, note)
	}
	sort.SliceStable(notes, func(i, j int) bool {
		if notes[i].Date != notes[j].Date {
			return notes[i].Date > notes[j].Date
		}
		return notes[i].Name > notes[j].Name
	})
	return notes, nil
}

func (s *Store) GetNote(rel string) (Note, error) {
	full, err := s.resolve(KindNotes, rel)
	if err != nil {
		return Note{}, err
	}
	if !strings.HasSuffix(strings.ToLower(full), ".md") {
		return Note{}, ErrInvalidPath
	}
	raw, err := os.ReadFile(full)
	if err != nil {
		return Note{}, ErrNotFound
	}
	fm, body, err := parseFrontMatter(string(raw))
	if err != nil {
		return Note{}, err
	}
	name := strings.TrimSuffix(path.Base(rel), ".md")
	if fm.Title == "" {
		fm.Title = name
	}
	if fm.Date == "" {
		if info, statErr := os.Stat(full); statErr == nil {
			fm.Date = info.ModTime().Format("2006-01-02")
		}
	}
	return Note{
		Path:    rel,
		Name:    name,
		Title:   fm.Title,
		Date:    fm.Date,
		Tags:    fm.Tags,
		Slug:    fm.Slug,
		Content: body,
	}, nil
}

func (s *Store) CreateNote(category, name string, in NoteInput) (Note, error) {
	dir, err := s.resolve(KindNotes, category)
	if err != nil {
		return Note{}, err
	}
	if info, err := os.Stat(dir); err != nil || !info.IsDir() {
		return Note{}, ErrNotFound
	}

	base := strings.TrimSuffix(strings.TrimSpace(name), ".md")
	if base == "" {
		base = in.Title
	}
	base = Slugify(base)
	if base == "" {
		base = "untitled-" + time.Now().Format("20060102-150405")
	}
	rel := path.Join(category, base+".md")
	full, err := s.resolve(KindNotes, rel)
	if err != nil {
		return Note{}, err
	}
	if _, err := os.Stat(full); err == nil {
		return Note{}, ErrExists
	}
	if err := writeNote(full, in, base); err != nil {
		return Note{}, err
	}
	return s.GetNote(rel)
}

func (s *Store) UpdateNote(rel string, in NoteInput) (Note, error) {
	full, err := s.resolve(KindNotes, rel)
	if err != nil {
		return Note{}, err
	}
	if !strings.HasSuffix(strings.ToLower(full), ".md") {
		return Note{}, ErrInvalidPath
	}
	if _, err := os.Stat(full); err != nil {
		return Note{}, ErrNotFound
	}
	base := strings.TrimSuffix(path.Base(rel), ".md")
	if err := writeNote(full, in, base); err != nil {
		return Note{}, err
	}
	return s.GetNote(rel)
}

func (s *Store) DeleteNote(rel string) error {
	full, err := s.resolve(KindNotes, rel)
	if err != nil {
		return err
	}
	if !strings.HasSuffix(strings.ToLower(full), ".md") {
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

func writeNote(full string, in NoteInput, fallbackName string) error {
	title := strings.TrimSpace(in.Title)
	if title == "" {
		title = fallbackName
	}
	date := strings.TrimSpace(in.Date)
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}
	tags := make([]string, 0, len(in.Tags))
	for _, tag := range in.Tags {
		if tag = strings.TrimSpace(tag); tag != "" {
			tags = append(tags, tag)
		}
	}
	fm := frontMatter{Title: title, Date: date, Tags: tags, Slug: strings.TrimSpace(in.Slug)}
	head, err := yaml.Marshal(fm)
	if err != nil {
		return err
	}

	var b strings.Builder
	b.WriteString("---\n")
	b.Write(head)
	b.WriteString("---\n\n")
	b.WriteString(strings.TrimLeft(strings.ReplaceAll(in.Content, "\r\n", "\n"), "\n"))
	if !strings.HasSuffix(b.String(), "\n") {
		b.WriteString("\n")
	}
	if err := os.MkdirAll(filepath.Dir(full), 0o755); err != nil {
		return err
	}
	return os.WriteFile(full, []byte(b.String()), 0o644)
}

func parseFrontMatter(raw string) (frontMatter, string, error) {
	var fm frontMatter
	raw = strings.TrimPrefix(raw, "\ufeff")
	raw = strings.ReplaceAll(raw, "\r\n", "\n")
	lines := strings.Split(raw, "\n")
	if len(lines) == 0 || strings.TrimSpace(lines[0]) != "---" {
		return fm, raw, nil
	}
	end := -1
	for i := 1; i < len(lines); i++ {
		if strings.TrimSpace(lines[i]) == "---" {
			end = i
			break
		}
	}
	if end < 0 {
		return fm, raw, nil
	}
	body := strings.Join(lines[end+1:], "\n")
	body = strings.TrimPrefix(body, "\n")

	var data map[string]any
	if err := yaml.Unmarshal([]byte(strings.Join(lines[1:end], "\n")), &data); err != nil {
		return fm, body, err
	}
	fm.Title = asString(data["title"])
	fm.Date = asString(data["date"])
	fm.Tags = asStringSlice(data["tags"])
	fm.Slug = asString(data["slug"])
	return fm, body, nil
}

func asString(v any) string {
	switch value := v.(type) {
	case nil:
		return ""
	case string:
		return strings.TrimSpace(value)
	case time.Time:
		return value.Format("2006-01-02")
	default:
		return strings.TrimSpace(fmt.Sprint(value))
	}
}

func asStringSlice(v any) []string {
	var out []string
	switch value := v.(type) {
	case nil:
		return nil
	case []string:
		return value
	case []any:
		for _, item := range value {
			if s := asString(item); s != "" {
				out = append(out, s)
			}
		}
	case string:
		for _, part := range strings.Split(value, ",") {
			if s := strings.TrimSpace(part); s != "" {
				out = append(out, s)
			}
		}
	}
	return out
}
