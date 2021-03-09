@echo off

SET BASE_DIR=%~dp0..
CALL %BASE_DIR%\config\environment.bat

CALL %~dp0build.bat PROD %ENV_LOGDATETIME%
CALL %~dp0build.bat TEST %ENV_LOGDATETIME%
CALL %~dp0build.bat DEV %ENV_LOGDATETIME%

