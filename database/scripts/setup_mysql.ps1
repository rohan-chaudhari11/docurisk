# =============================================================================
# DocuRisk AI — Setup MySQL Database & Run Migrations
# Usage:
#   .\setup_mysql.ps1
#   .\setup_mysql.ps1 -RootUser "root"
# =============================================================================

param (
    [string]$RootUser = "root",
    [string]$MySQLBinPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
)

if (-not (Test-Path $MySQLBinPath)) {
    $found = Get-Command mysql -ErrorAction SilentlyContinue
    if ($found) {
        $MySQLBinPath = $found.Source
    } else {
        Write-Error "MySQL client binary not found at '$MySQLBinPath'. Please ensure MySQL 8.0 is installed or on PATH."
        exit 1
    }
}

Write-Host "DocuRisk AI — MySQL Setup" -ForegroundColor Cyan
Write-Host "MySQL Binary: $MySQLBinPath" -ForegroundColor Gray

$password = Read-Host "Enter MySQL password for '$RootUser'" -AsSecureString
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$setupSql = Join-Path $scriptDir "setup_dev_database.sql"
$schemaSql = Join-Path (Split-Path -Parent $scriptDir) "schema\01_init_schema.sql"
$seedSql = Join-Path (Split-Path -Parent $scriptDir) "seeds\02_sample_contracts_seed.sql"

Write-Host "1. Creating database and application user..." -ForegroundColor Yellow
& $MySQLBinPath -u $RootUser "-p$plainPassword" -e "source $setupSql"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to configure database user."
    exit $LASTEXITCODE
}

Write-Host "2. Running schema migrations..." -ForegroundColor Yellow
& $MySQLBinPath -u docurisk_user "-pdocurisk_secure_password" -e "source $schemaSql"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to apply schema migrations."
    exit $LASTEXITCODE
}

Write-Host "3. Seeding sample contracts and diffs..." -ForegroundColor Yellow
& $MySQLBinPath -u docurisk_user "-pdocurisk_secure_password" -e "source $seedSql"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to seed sample contracts."
    exit $LASTEXITCODE
}

Write-Host "MySQL development database setup complete!" -ForegroundColor Green
Write-Host "Database: docurisk_db" -ForegroundColor Gray
Write-Host "User: docurisk_user" -ForegroundColor Gray
