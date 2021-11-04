REM Zentrale Definition der Endungen von Log-Files
@for /F "tokens=1,2" %%d in ('date /T') do set xdate=%%d
@for /F "tokens=1,2" %%e in ('time /T') do set xtime=%%e
SET ENV_LOGDATE=%xDATE:~6,4%-%xDATE:~3,2%-%xDATE:~0,2%
SET ENV_LOGDATETIME=%xDATE:~6,4%-%xDATE:~3,2%-%xDATE:~0,2%_%xtime:~0,2%-%xtime:~3,2%

REM Diese Liste der Namen repräsentiert die zu kopierenden Widgets
SET WIDGET_NAMES=kpb-immo-calc

REM Vorbelegung von Variablen mit dummy-Werten
SET BUILDER_WIDGET_FOLDER=[PATH-TO-WEBAPP-BUILDER-CLIENT-STEMAPP-WIDGETS-FOLDER]

REM Modus für die Anwendung festelgen
SET APPLICATION_MODE_PROD=1
SET APPLICATION_MODE_TEST=2
SET APPLICATION_MODE_DEV=3

REM Festlegen, ob STAG=NULL angezeigt werden soll und wenn ja, als was ("--none--" bedeutet, keine Verwendung)
SET USE_STAG_NULL_AS_PROD=--none--
SET USE_STAG_NULL_AS_TEST=Bearbeitung
SET USE_STAG_NULL_AS_DEV=Bearbeitung


REM Hauptfarbe des verwendeten Themes
SET THEME_COLOR_RED_PROD=0
SET THEME_COLOR_GREEN_PROD=78
SET THEME_COLOR_BLUE_PROD=151

SET THEME_COLOR_RED_TEST=171
SET THEME_COLOR_GREEN_TEST=110
SET THEME_COLOR_BLUE_TEST=173

SET THEME_COLOR_RED_DEV=0
SET THEME_COLOR_GREEN_DEV=78
SET THEME_COLOR_BLUE_DEV=151

REM Überladen von Variablen durch spezifischen Festlegungen
IF EXIST "%~dp0environment_custom.bat" CALL "%~dp0environment_custom.bat"

