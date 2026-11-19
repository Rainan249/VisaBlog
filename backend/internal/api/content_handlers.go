package api

import (
	"net/http"

	"visablog/backend/internal/store"
)

func (s *Server) handleTree(w http.ResponseWriter, r *http.Request) {
	kind := r.URL.Query().Get("kind")
	if kind == "" {
		kind = store.KindNotes
	}
	nodes, err := s.store.Tree(kind)
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"tree": nodes})
}

type categoryRequest struct {
	Kind   string `json:"kind"`
	Parent string `json:"parent"`
	Name   string `json:"name"`
	Path   string `json:"path"`
}

func (s *Server) handleCreateCategory(w http.ResponseWriter, r *http.Request) {
	var req categoryRequest
	if err := decodeJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "请求格式错误")
		return
	}
	if req.Kind == "" {
		req.Kind = store.KindNotes
	}
	node, err := s.store.CreateCategory(req.Kind, req.Parent, req.Name)
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, node)
}

func (s *Server) handleRenameCategory(w http.ResponseWriter, r *http.Request) {
	var req categoryRequest
	if err := decodeJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "请求格式错误")
		return
	}
	if req.Kind == "" {
		req.Kind = store.KindNotes
	}
	node, err := s.store.RenameCategory(req.Kind, req.Path, req.Name)
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, node)
}

func (s *Server) handleDeleteCategory(w http.ResponseWriter, r *http.Request) {
	kind := r.URL.Query().Get("kind")
	if kind == "" {
		kind = store.KindNotes
	}
	if err := s.store.DeleteCategory(kind, r.URL.Query().Get("path")); err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleListNotes(w http.ResponseWriter, r *http.Request) {
	notes, err := s.store.ListNotes(r.URL.Query().Get("category"))
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"notes": notes})
}

func (s *Server) handleGetNote(w http.ResponseWriter, r *http.Request) {
	note, err := s.store.GetNote(r.URL.Query().Get("path"))
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, note)
}

type notePayload struct {
	Category string   `json:"category"`
	Name     string   `json:"name"`
	Title    string   `json:"title"`
	Date     string   `json:"date"`
	Tags     []string `json:"tags"`
	Slug     string   `json:"slug"`
	Content  string   `json:"content"`
}

func (p notePayload) input() store.NoteInput {
	return store.NoteInput{Title: p.Title, Date: p.Date, Tags: p.Tags, Slug: p.Slug, Content: p.Content}
}

func (s *Server) handleCreateNote(w http.ResponseWriter, r *http.Request) {
	var req notePayload
	if err := decodeJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "请求格式错误")
		return
	}
	note, err := s.store.CreateNote(req.Category, req.Name, req.input())
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, note)
}

func (s *Server) handleUpdateNote(w http.ResponseWriter, r *http.Request) {
	var req notePayload
	if err := decodeJSON(w, r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "请求格式错误")
		return
	}
	note, err := s.store.UpdateNote(r.URL.Query().Get("path"), req.input())
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, note)
}

func (s *Server) handleDeleteNote(w http.ResponseWriter, r *http.Request) {
	if err := s.store.DeleteNote(r.URL.Query().Get("path")); err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleListImages(w http.ResponseWriter, r *http.Request) {
	images, err := s.store.ListImages(r.URL.Query().Get("category"))
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"images": images})
}

func (s *Server) handleUploadImages(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 64<<20)
	if err := r.ParseMultipartForm(64 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "上传内容过大或格式错误")
		return
	}
	files := r.MultipartForm.File["files"]
	if len(files) == 0 {
		files = r.MultipartForm.File["file"]
	}
	if len(files) == 0 {
		writeError(w, http.StatusBadRequest, "没有选择文件")
		return
	}
	images, err := s.store.SaveImages(r.URL.Query().Get("category"), files)
	if err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"images": images})
}

func (s *Server) handleDeleteImage(w http.ResponseWriter, r *http.Request) {
	if err := s.store.DeleteImage(r.URL.Query().Get("path")); err != nil {
		writeError(w, statusFor(err), err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
