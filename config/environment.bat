REM Diese Liste der Namen repräsentiert die zu kopierenden Widgets
SET WIDGET_NAMES=kpb-immo-calc

REM Vorbelegung von Variablen mit dummy-Werten
SET APPLICATION_FOLDER=[PATH-TO-WEBAPP-BUILDER-SERVER-APPS-WIDGETS-FOLDER]
SET BUILDER_WIDGET_FOLDER=[PATH-TO-WEBAPP-BUILDER-CLIENT-STEMAPP-WIDGETS-FOLDER]

REM Überladen von Variablen durch spezifischen Festlegungen
IF EXIST "%~dp0environment_custom.bat" CALL "%~dp0environment_custom.bat"