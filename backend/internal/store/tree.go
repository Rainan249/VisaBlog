package store

import (
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
)

// Node 是分类树节点（只包含目录）。
type Node struct {
	Name     string  `json:"name"`
	Path     string  `json:"path"`
	Children []*Node `json:"children"`
}

func (s *Store) Tree(kind string) ([]*Node, error) {
	root, err := s.root(kind)
	if err != nil {
		return nil, err
	}
	nodes, err := walkTree(root, "")
	if err != nil {
		return nil, err
	}
	if nodes == nil {
		nodes = []*Node{}
	}
	return nodes, nil
}

func walkTree(dir, rel string) ([]*Node, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name() < entries[j].Name() })

	var nodes []*Node
	for _, entry := range entries {
		if !entry.IsDir() || strings.HasPrefix(entry.Name(), ".") {
			continue
		}
		childRel := path.Join(rel, entry.Name())
		children, err := walkTree(filepath.Join(dir, entry.Name()), childRel)
		if err != nil {
			return nil, err
		}
		if children == nil {
			children = []*Node{}
		}
		nodes = append(nodes, &Node{Name: entry.Name(), Path: childRel, Children: children})
	}
	return nodes, nil
}

// CreateCategory 在 parent 下创建一级分类。
func (s *Store) CreateCategory(kind, parent, name string) (*Node, error) {
	name = strings.TrimSpace(name)
	if name == "" || strings.ContainsAny(name, `/\`) {
		return nil, ErrInvalidPath
	}
	cleanName, err := SanitizeRel(name)
	if err != nil || strings.Contains(cleanName, "/") {
		return nil, ErrInvalidPath
	}

	parentDir, err := s.resolve(kind, parent)
	if err != nil {
		return nil, err
	}
	if info, err := os.Stat(parentDir); err != nil || !info.IsDir() {
		return nil, ErrNotFound
	}

	rel := path.Join(parent, name)
	target, err := s.resolve(kind, rel)
	if err != nil {
		return nil, err
	}
	if _, err := os.Stat(target); err == nil {
		return nil, ErrExists
	}
	if err := os.MkdirAll(target, 0o755); err != nil {
		return nil, err
	}
	return &Node{Name: name, Path: rel, Children: []*Node{}}, nil
}

// RenameCategory 只改最后一级目录名。
func (s *Store) RenameCategory(kind, rel, newName string) (*Node, error) {
	newName = strings.TrimSpace(newName)
	if newName == "" || strings.ContainsAny(newName, `/\`) {
		return nil, ErrInvalidPath
	}
	src, err := s.resolve(kind, rel)
	if err != nil {
		return nil, err
	}
	parent := path.Dir(rel)
	newRel := path.Join(parent, newName)
	dst, err := s.resolve(kind, newRel)
	if err != nil {
		return nil, err
	}
	if _, err := os.Stat(dst); err == nil {
		return nil, ErrExists
	}
	if err := os.Rename(src, dst); err != nil {
		return nil, err
	}
	return &Node{Name: newName, Path: newRel, Children: []*Node{}}, nil
}

func (s *Store) DeleteCategory(kind, rel string) error {
	if strings.TrimSpace(rel) == "" {
		return ErrInvalidPath
	}
	target, err := s.resolve(kind, rel)
	if err != nil {
		return err
	}
	entries, err := os.ReadDir(target)
	if err != nil {
		return ErrNotFound
	}
	if len(entries) > 0 {
		return ErrNotEmpty
	}
	return os.Remove(target)
}
