@echo off
echo Building Kotlin/JS with Compose for Web...
cd kotlin
call gradlew jsBrowserProductionWebpack
cd ..
echo.
echo Copying files to root and pages...
copy /Y kotlin\build\dist\js\productionExecutable\main.js .
copy /Y kotlin\build\dist\js\productionExecutable\index.html .
echo.
echo Done! Files are ready.
echo - main.js copied to root (used by both index.html and pages/learn/learn.html)
echo - index.html copied to root
