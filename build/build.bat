REM Define general settings
@echo off

SET BASE_DIR=%~dp0..
CALL %BASE_DIR%\config\environment.bat

for %%a in (%WIDGET_NAMES%) do call :copy_widget %%a
goto :continue1

:copy_widget
    set WIDGET_NAME=%1

    REM -------------------------
    REM Programm-Dateien kopieren
    SET APP_TARGET_DIR=%APPLICATION_FOLDER%widgets\%WIDGET_NAME%
    SET BUILDER_TARGET_DIR=%BUILDER_WIDGET_FOLDER%%WIDGET_NAME%
    echo APP_TARGET_DIR "%APP_TARGET_DIR%"
    echo BUILDER_TARGET_DIR "%BUILDER_TARGET_DIR%"
    mkdir "%APP_TARGET_DIR%"
    mkdir "%BUILDER_TARGET_DIR%"
    xcopy "..\source\%WIDGET_NAME%" "%APP_TARGET_DIR%" /Y /s
    xcopy "..\source\%WIDGET_NAME%" "%BUILDER_TARGET_DIR%" /Y /s

:continue1    







