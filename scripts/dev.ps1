[CmdletBinding()]
param(
    [switch]$NoBrowser,
    [switch]$SmokeTest,
    [string]$GoExe = ""
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "fronted"
$RunDir = Join-Path $Root ".run"
$ToolsDir = Join-Path $Root ".tools"

$BackendPort = 8080
$FrontendPort = 5173

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "    $Message" -ForegroundColor Green
}

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "[错误] $Message" -ForegroundColor Red
    exit 1
}

function Test-PortBusy([int]$Port) {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $conn
}

function Wait-Port([int]$Port, [int]$TimeoutSeconds) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $client = New-Object System.Net.Sockets.TcpClient
            $client.Connect("127.0.0.1", $Port)
            $client.Close()
            return $true
        } catch {
            Start-Sleep -Milliseconds 300
        }
    }
    return $false
}

function Stop-Port([int]$Port) {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

function New-RandomHex([int]$Bytes) {
    $buffer = New-Object byte[] $Bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($buffer)
    $rng.Dispose()
    return -join ($buffer | ForEach-Object { $_.ToString("x2") })
}

function Resolve-Go {
    if ($GoExe) {
        if (-not (Test-Path $GoExe)) { Fail "指定的 Go 不存在：$GoExe" }
        return (Resolve-Path $GoExe).Path
    }

    $cmd = Get-Command go -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $localGo = Join-Path $ToolsDir "go\bin\go.exe"
    if (Test-Path $localGo) { return $localGo }

    $candidates = @(
        "C:\Program Files\Go\bin\go.exe",
        (Join-Path $env:LOCALAPPDATA "Programs\Go\bin\go.exe"),
        (Join-Path $env:USERPROFILE "go\bin\go.exe")
    )
    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path $candidate)) { return $candidate }
    }

    Write-Step "未检测到 Go，正在下载便携版 Go 1.27.4（约 75 MB，1-3 分钟）"
    Write-Host "    请保持窗口打开，下载完成后会自动继续。" -ForegroundColor DarkGray
    New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null
    $zip = Join-Path $ToolsDir "go.zip"
    Remove-Item $zip -Force -ErrorAction SilentlyContinue

    $mirrors = @(
        "https://golang.google.cn/dl/go1.27.4.windows-amd64.zip",
        "https://go.dev/dl/go1.27.4.windows-amd64.zip"
    )
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    $downloaded = $false
    foreach ($mirror in $mirrors) {
        Write-Host "    下载: $mirror" -ForegroundColor DarkGray
        try {
            if ($curl) {
                & $curl.Source -L --fail --retry 2 --connect-timeout 20 --progress-bar -o $zip $mirror
                $code = $LASTEXITCODE
                if ($code -ne 0) { throw "curl 退出码 $code" }
            } else {
                Invoke-WebRequest -Uri $mirror -OutFile $zip -UseBasicParsing -TimeoutSec 900
            }
            if ((Test-Path $zip) -and ((Get-Item $zip).Length -gt 10MB)) {
                $downloaded = $true
                break
            }
        } catch {
            Write-Host "    失败: $($_.Exception.Message)" -ForegroundColor Yellow
            Remove-Item $zip -Force -ErrorAction SilentlyContinue
        }
    }
    if (-not $downloaded) {
        Fail "下载 Go 失败。请手动安装 Go 1.26+（https://golang.google.cn/dl/），或用 -GoExe 指定路径。"
    }
    try {
        Expand-Archive -Path $zip -DestinationPath $ToolsDir -Force
    } catch {
        Remove-Item $zip -Force -ErrorAction SilentlyContinue
        Fail "Go 压缩包解压失败：$($_.Exception.Message)"
    }
    Remove-Item $zip -Force -ErrorAction SilentlyContinue

    if (-not (Test-Path $localGo)) { Fail "Go 解压失败，未找到 $localGo" }
    Write-Ok "Go 已安装到 $localGo"
    return $localGo
}

function Ensure-EnvFile {
    $envPath = Join-Path $BackendDir ".env"
    if (Test-Path $envPath) { return }

    Write-Step "首次运行：生成 backend/.env"
    $examplePath = Join-Path $BackendDir ".env.example"
    $example = [System.IO.File]::ReadAllText($examplePath, [System.Text.UTF8Encoding]::new($false))
    $password = New-RandomHex 6
    $secret = New-RandomHex 32
    $content = $example.Replace("ADMIN_PASSWORD=change-me-please", "ADMIN_PASSWORD=$password")
    $content = $content.Replace("SESSION_SECRET=please-change-to-a-long-random-string", "SESSION_SECRET=$secret")
    [System.IO.File]::WriteAllText($envPath, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Ok "已生成账号 admin / 密码 $password（可在 backend/.env 修改）"
}

function Get-AdminPassword {
    $envPath = Join-Path $BackendDir ".env"
    if (-not (Test-Path $envPath)) { return "" }
    $line = Get-Content $envPath | Where-Object { $_ -match "^\s*ADMIN_PASSWORD\s*=" } | Select-Object -First 1
    if (-not $line) { return "" }
    return ($line -replace "^\s*ADMIN_PASSWORD\s*=\s*", "").Trim().Trim('"').Trim("'")
}

# ---------- 前置检查 ----------

Write-Step "检查运行环境"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail "未找到 Node.js，请先安装 Node.js 20+。"
}
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue) -and -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Fail "未找到 npm，请检查 Node.js 安装。"
}
Write-Ok "Node $(node --version)"

$go = Resolve-Go
$goVersion = (& $go version 2>&1 | Out-String).Trim()
Write-Ok $goVersion

if (Test-PortBusy $BackendPort) { Fail "端口 $BackendPort 已被占用，请先关闭占用程序。" }
if (Test-PortBusy $FrontendPort) { Fail "端口 $FrontendPort 已被占用，请先关闭占用程序。" }

Ensure-EnvFile

if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Step "安装前端依赖（npm install，第一次会慢一些）"
    Push-Location $FrontendDir
    try {
        $npmOutput = & npm.cmd install --no-audit --no-fund 2>&1
        if ($LASTEXITCODE -ne 0) {
            $npmOutput | ForEach-Object { Write-Host $_ }
            Fail "npm install 失败"
        }
    } finally {
        Pop-Location
    }
    Write-Ok "依赖安装完成"
}

New-Item -ItemType Directory -Force -Path $RunDir | Out-Null
$backendLog = Join-Path $RunDir "backend.log"
$backendErr = Join-Path $RunDir "backend.err.log"
$frontendLog = Join-Path $RunDir "frontend.log"
$frontendErr = Join-Path $RunDir "frontend.err.log"
Remove-Item $backendLog, $backendErr, $frontendLog, $frontendErr -Force -ErrorAction SilentlyContinue

# ---------- 构建并启动后端 ----------

Write-Step "编译后端"
$serverExe = Join-Path $RunDir "visablog-server.exe"
# 固定 Go 的缓存与临时目录，避免受限环境/杀软拦截 %TEMP%
$env:GOCACHE = Join-Path $RunDir "gocache"
$env:GOTMPDIR = Join-Path $RunDir "gotmp"
New-Item -ItemType Directory -Force -Path $env:GOCACHE, $env:GOTMPDIR | Out-Null
Push-Location $BackendDir
try {
    $buildOutput = & $go build -o $serverExe ./cmd/server 2>&1
    if ($LASTEXITCODE -ne 0) {
        $buildOutput | ForEach-Object { Write-Host $_ }
        Fail "后端编译失败"
    }
} finally {
    Pop-Location
}
Write-Ok "编译完成"

Write-Step "启动后端 :$BackendPort"
$backendProc = Start-Process -FilePath $serverExe `
    -WorkingDirectory $BackendDir `
    -RedirectStandardOutput $backendLog `
    -RedirectStandardError $backendErr `
    -PassThru -WindowStyle Hidden

Write-Step "启动前端 :$FrontendPort"
$frontendProc = Start-Process -FilePath "npm.cmd" `
    -ArgumentList @("run", "dev", "--", "--port", "$FrontendPort", "--strictPort") `
    -WorkingDirectory $FrontendDir `
    -RedirectStandardOutput $frontendLog `
    -RedirectStandardError $frontendErr `
    -PassThru -WindowStyle Hidden

$started = $false
try {
    if (-not (Wait-Port $BackendPort 60)) {
        Write-Host "--- backend.log ---" -ForegroundColor Yellow
        Get-Content $backendLog, $backendErr -ErrorAction SilentlyContinue | Select-Object -Last 40
        Fail "后端 60 秒内未启动。"
    }
    if (-not (Wait-Port $FrontendPort 90)) {
        Write-Host "--- frontend.log ---" -ForegroundColor Yellow
        Get-Content $frontendLog, $frontendErr -ErrorAction SilentlyContinue | Select-Object -Last 40
        Fail "前端 90 秒内未启动。"
    }
    $started = $true
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "  后端 API : http://localhost:$BackendPort" -ForegroundColor Green
    Write-Host "  博客站点 : http://localhost:$FrontendPort/" -ForegroundColor Green
    Write-Host "  管理后台 : http://localhost:$FrontendPort/admin" -ForegroundColor Green
    $password = Get-AdminPassword
    if ($password) { Write-Host "  后台账号 : admin / $password" -ForegroundColor Green }
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "日志目录: $RunDir"
    Write-Host "按 Ctrl+C 停止所有服务。" -ForegroundColor DarkGray

    if ($SmokeTest) {
        Write-Step "冒烟测试"
        $health = Invoke-RestMethod "http://127.0.0.1:$BackendPort/api/health" -TimeoutSec 10
        if ($health.status -ne "ok") { Fail "后端健康检查失败" }
        Write-Ok "后端 /api/health OK"
        $admin = Invoke-WebRequest "http://127.0.0.1:$FrontendPort/admin" -UseBasicParsing -TimeoutSec 15
        if ($admin.StatusCode -ne 200) { Fail "后台页面返回 $($admin.StatusCode)" }
        Write-Ok "后台页面 HTTP 200"
        $login = Invoke-RestMethod "http://127.0.0.1:$BackendPort/api/admin/login" -Method POST `
            -ContentType "application/json; charset=utf-8" `
            -Body ([Text.Encoding]::UTF8.GetBytes((@{ username = "admin"; password = $password } | ConvertTo-Json))) `
            -SessionVariable session
        if (-not $login.username) { Fail "登录接口失败" }
        Write-Ok "登录接口 OK（$($login.username)）"
        $tree = Invoke-RestMethod "http://127.0.0.1:$BackendPort/api/admin/tree?kind=notes" -WebSession $session
        Write-Ok "分类树 OK（$($tree.tree.Count) 个顶级分类）"
        Write-Host "SMOKE TEST PASSED" -ForegroundColor Green
        return
    }

    if (-not $NoBrowser) {
        Start-Process "http://localhost:$FrontendPort/admin" | Out-Null
    }

    while ($true) {
        Start-Sleep -Seconds 1
        if ($backendProc.HasExited) { Fail "后端进程已退出，请查看 $backendErr" }
        if ($frontendProc.HasExited) { Fail "前端进程已退出，请查看 $frontendErr" }
    }
} finally {
    if ($started -or $null -ne $backendProc -or $null -ne $frontendProc) {
        Write-Host ""
        Write-Host "正在停止服务..." -ForegroundColor DarkGray
    }
    Stop-Port $FrontendPort
    Stop-Port $BackendPort
    if ($backendProc -and -not $backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue }
    if ($frontendProc -and -not $frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue }
}
