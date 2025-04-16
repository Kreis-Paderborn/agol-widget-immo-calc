REM Define general settings
@echo off

SET BASE_DIR=%~dp0..
CALL %BASE_DIR%\config\environment.bat

SET BUILD_TIMESTAMP=%2

REM Applikationsordner je nach Parameter festlegen
IF "%APPLICATION_FOLDER%"=="" (
    IF "%APPLICATION_BASE_FOLDER%"=="" (
        echo.
        echo ===============================================
        echo Variable APPLICATION_BASE_FOLDER ist nicht gesetzt.
        echo Daher kann kein Build durchgefuehrt werden.
        echo ===============================================
        echo.
        goto :end1

    ) ELSE (
        IF "%1"=="PROD" (
            IF "%APPLICATION_ID_PROD%"=="" (
                echo.
                echo ===============================================
                echo Fuer %1 ist keine APPLICATION_ID_%1 definert. 
                echo Wird uebersprungen!
                echo ===============================================
                echo.
                goto :end1
            ) ELSE (
                SET APPLICATION_FOLDER=%APPLICATION_BASE_FOLDER%%APPLICATION_ID_PROD%\
            )
        ) ELSE IF "%1"=="TEST" (
            IF "%APPLICATION_ID_TEST%"=="" (
                echo.
                echo ===============================================
                echo Fuer %1 ist keine APPLICATION_ID_%1 definert. 
                echo Wird uebersprungen!
                echo ===============================================
                echo.
                goto :end1
            ) ELSE (
                SET APPLICATION_FOLDER=%APPLICATION_BASE_FOLDER%%APPLICATION_ID_TEST%\
            )
        ) ELSE (
            IF "%APPLICATION_ID_DEV%"=="" (
                echo.
                echo ===============================================
                echo Fuer %1 ist keine APPLICATION_ID_%1 definert. 
                echo Wird uebersprungen!
                echo ===============================================
                echo.
                goto :end1
            ) ELSE (
                SET APPLICATION_FOLDER=%APPLICATION_BASE_FOLDER%%APPLICATION_ID_DEV%\
            )
        )
    )
)

echo.
echo ===============================================
echo Baue %1 nach %APPLICATION_FOLDER%
echo ===============================================
echo.

REM Basispfad zum FME-Flow
IF "%FME_SERVER_BASE_URL%"=="" (
    IF "%1"=="PROD" (
        SET FME_SERVER_BASE_URL=%FME_SERVER_BASE_URL_PROD%
    ) ELSE IF "%1"=="TEST" (
        SET FME_SERVER_BASE_URL=%FME_SERVER_BASE_URL_TEST%
    ) ELSE (
        SET FME_SERVER_BASE_URL=%FME_SERVER_BASE_URL_DEV%
    )
)

REM Token für FME-Flow Gast-Aufrufe
IF "%FME_SERVER_KPBGUEST_TOKEN%"=="" (
    IF "%1"=="PROD" (
        SET FME_SERVER_KPBGUEST_TOKEN=%FME_SERVER_KPBGUEST_TOKEN_PROD%
    ) ELSE IF "%1"=="TEST" (
        SET FME_SERVER_KPBGUEST_TOKEN=%FME_SERVER_KPBGUEST_TOKEN_TEST%
    ) ELSE (
        SET FME_SERVER_KPBGUEST_TOKEN=%FME_SERVER_KPBGUEST_TOKEN_DEV%
    )
)

REM Applikationsmodus je nach Parameter festlegen
IF "%APPLICATION_MODE%"=="" (
    IF "%1"=="PROD" (
        SET APPLICATION_MODE=%APPLICATION_MODE_PROD%
    ) ELSE IF "%1"=="TEST" (
        SET APPLICATION_MODE=%APPLICATION_MODE_TEST%
    ) ELSE (
        SET APPLICATION_MODE=%APPLICATION_MODE_DEV%
    )
)

REM Maximal zu verwendender Jahrgang
IF "%USE_STAG_NULL_AS%"=="" (
    IF "%1"=="PROD" (
        SET USE_STAG_NULL_AS=%USE_STAG_NULL_AS_PROD%
    ) ELSE IF "%1"=="TEST" (
        SET USE_STAG_NULL_AS=%USE_STAG_NULL_AS_TEST%
    ) ELSE (
        SET USE_STAG_NULL_AS=%USE_STAG_NULL_AS_DEV%
    )
)

REM Rotanteil der Hauptfarbe des verwendeten Themes
IF "%THEME_COLOR_RED%"=="" (
    IF "%1"=="PROD" (
        SET THEME_COLOR_RED=%THEME_COLOR_RED_PROD%
    ) ELSE IF "%1"=="TEST" (
        SET THEME_COLOR_RED=%THEME_COLOR_RED_TEST%
    ) ELSE (
        SET THEME_COLOR_RED=%THEME_COLOR_RED_DEV%
    )
)

REM Grünanteil der Hauptfarbe des verwendeten Themes
IF "%THEME_COLOR_GREEN%"=="" (
    IF "%1"=="PROD" (
        SET THEME_COLOR_GREEN=%THEME_COLOR_GREEN_PROD%
    ) ELSE IF "%1"=="TEST" (
        SET THEME_COLOR_GREEN=%THEME_COLOR_GREEN_TEST%
    ) ELSE (
        SET THEME_COLOR_GREEN=%THEME_COLOR_GREEN_DEV%
    )
)

REM Blauanteil der Hauptfarbe des verwendeten Themes
IF "%THEME_COLOR_BLUE%"=="" (
    IF "%1"=="PROD" (
        SET THEME_COLOR_BLUE=%THEME_COLOR_BLUE_PROD%
    ) ELSE IF "%1"=="TEST" (
        SET THEME_COLOR_BLUE=%THEME_COLOR_BLUE_TEST%
    ) ELSE (
        SET THEME_COLOR_BLUE=%THEME_COLOR_BLUE_DEV%
    )
)

for %%a in (%WIDGET_NAMES%) do call :copy_widget %%a
SET "APPLICATION_FOLDER="
SET "APPLICATION_MODE="
SET "USE_STAG_NULL_AS="
SET "THEME_COLOR_RED="
SET "THEME_COLOR_GREEN="
SET "THEME_COLOR_BLUE="
goto :end1

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

    REM -------------------------
    REM Konfig-Datei kopieren
    SET CONFIG_TARGET_FILE=%APPLICATION_FOLDER%configs\%WIDGET_NAME%\config_%WIDGET_NAME%.json
    REM ensure the file exists, because xcopy should not promt for creating the file
    IF NOT EXIST "%CONFIG_TARGET_FILE%" (
        echo dummy > "%CONFIG_TARGET_FILE%"
    )
    xcopy "..\source\%WIDGET_NAME%\config.json" "%CONFIG_TARGET_FILE%" /y /i

    REM -------------------------
    REM Platzhalter in der kopierten Konfig-Datei ersetzen
    call replace.bat "%CONFIG_TARGET_FILE%" ${APPLICATION_MODE} %APPLICATION_MODE%
    call replace.bat "%CONFIG_TARGET_FILE%" ${BUILD_TIMESTAMP} %BUILD_TIMESTAMP%
    call replace.bat "%CONFIG_TARGET_FILE%" ${USE_STAG_NULL_AS} %USE_STAG_NULL_AS%
    call replace.bat "%CONFIG_TARGET_FILE%" ${FME_SERVER_BASE_URL} %FME_SERVER_BASE_URL%
    call replace.bat "%CONFIG_TARGET_FILE%" ${FME_SERVER_KPBGUEST_TOKEN} %FME_SERVER_KPBGUEST_TOKEN%

    REM Platzhalter in CSS-Datei THEME_COMMON_ADDS ersetzen
    SET CSS_TARGET_FILE=%APP_TARGET_DIR%\css\theme_common_adds.css
    ECHO Ersetze in %CSS_TARGET_FILE%
    call replace.bat "%CSS_TARGET_FILE%" /*BUILD ""
    call replace.bat "%CSS_TARGET_FILE%" BUILD*/ ""
    call replace.bat "%CSS_TARGET_FILE%" ${THEME_COLOR_RED} %THEME_COLOR_RED%
    call replace.bat "%CSS_TARGET_FILE%" ${THEME_COLOR_GREEN} %THEME_COLOR_GREEN%
    call replace.bat "%CSS_TARGET_FILE%" ${THEME_COLOR_BLUE} %THEME_COLOR_BLUE%

:end1
  


 







