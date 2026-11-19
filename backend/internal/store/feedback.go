package store

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
	"unicode/utf8"
)

type Feedback struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Contact   string    `json:"contact"`
	Category  string    `json:"category"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

type FeedbackInput struct {
	Name     string `json:"name"`
	Contact  string `json:"contact"`
	Category string `json:"category"`
	Content  string `json:"content"`
}

func (s *Store) AddFeedback(in FeedbackInput) (Feedback, error) {
	content := strings.TrimSpace(in.Content)
	if content == "" {
		return Feedback{}, errors.New("意见内容不能为空")
	}
	if utf8.RuneCountInString(content) > 5000 {
		return Feedback{}, errors.New("意见内容不能超过 5000 字")
	}
	name := strings.TrimSpace(in.Name)
	if utf8.RuneCountInString(name) > 60 {
		return Feedback{}, errors.New("称呼过长")
	}
	contact := strings.TrimSpace(in.Contact)
	if utf8.RuneCountInString(contact) > 120 {
		return Feedback{}, errors.New("联系方式过长")
	}
	category := strings.TrimSpace(in.Category)
	if category == "" {
		category = "其他"
	}
	if utf8.RuneCountInString(category) > 20 {
		return Feedback{}, errors.New("分类过长")
	}

	now := time.Now()
	item := Feedback{
		ID:        now.Format("20060102-150405") + "-" + randomHex(4),
		Name:      name,
		Contact:   contact,
		Category:  category,
		Content:   content,
		CreatedAt: now,
	}

	raw, err := json.MarshalIndent(item, "", "  ")
	if err != nil {
		return Feedback{}, err
	}
	target := filepath.Join(s.FeedbackDir, item.ID+".json")
	if err := os.WriteFile(target, raw, 0o644); err != nil {
		return Feedback{}, err
	}
	return item, nil
}

func (s *Store) ListFeedback() ([]Feedback, error) {
	entries, err := os.ReadDir(s.FeedbackDir)
	if err != nil {
		return nil, err
	}
	items := make([]Feedback, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}
		raw, err := os.ReadFile(filepath.Join(s.FeedbackDir, entry.Name()))
		if err != nil {
			continue
		}
		var item Feedback
		if err := json.Unmarshal(raw, &item); err != nil {
			continue
		}
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool { return items[i].CreatedAt.After(items[j].CreatedAt) })
	return items, nil
}

func (s *Store) DeleteFeedback(id string) error {
	id = strings.TrimSpace(id)
	if id == "" || strings.ContainsAny(id, `/\`) || strings.Contains(id, "..") {
		return ErrInvalidPath
	}
	target := filepath.Join(s.FeedbackDir, id+".json")
	if err := os.Remove(target); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return ErrNotFound
		}
		return err
	}
	return nil
}

func randomHex(n int) string {
	buf := make([]byte, n)
	if _, err := rand.Read(buf); err != nil {
		return "000000"
	}
	return hex.EncodeToString(buf)
}
