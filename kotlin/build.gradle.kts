plugins {
    kotlin("multiplatform") version "1.9.22"
    id("org.jetbrains.compose") version "1.5.12"
}

group = "com.allanabrahao"
version = "1.0.0"

repositories {
    google()
    mavenCentral()
    maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
}

kotlin {
    js(IR) {
        browser {
            commonWebpackConfig {
                outputFileName = "main.js"
            }
        }
        binaries.executable()
    }

    sourceSets {
        val jsMain by getting {
            dependencies {
                implementation(compose.html.core)
                implementation(compose.runtime)
            }
        }
    }
}

