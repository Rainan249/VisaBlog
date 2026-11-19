package auth

import (
	"testing"

	"visablog/backend/internal/config"
)

func TestAuthDisabled(t *testing.T) {
	m, err := New(config.Config{AdminUsername: "admin", AdminPassword: "x", SessionSecret: "s", AuthDisabled: true})
	if err != nil {
		t.Fatal(err)
	}
	if !m.Authenticate("anyone", "wrong") {
		t.Fatal("AUTH_DISABLED=true 时应跳过密码校验")
	}
}

func TestAuthenticateAndToken(t *testing.T) {
	m, err := New(config.Config{
		AdminUsername: "admin",
		AdminPassword: "test123456",
		SessionSecret: "unit-test-secret",
	})
	if err != nil {
		t.Fatal(err)
	}

	if !m.Authenticate("admin", "test123456") {
		t.Fatal("正确密码应通过")
	}
	if m.Authenticate("admin", "wrong") {
		t.Fatal("错误密码不应通过")
	}
	if m.Authenticate("other", "test123456") {
		t.Fatal("错误用户名不应通过")
	}

	token, err := m.Issue("admin")
	if err != nil {
		t.Fatal(err)
	}
	user, err := m.Verify(token)
	if err != nil || user != "admin" {
		t.Fatalf("token 校验失败: %q %v", user, err)
	}
	if _, err := m.Verify(token + "x"); err == nil {
		t.Fatal("篡改后的 token 应被拒绝")
	}
}
