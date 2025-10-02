import androidx.compose.runtime.Composable
import kotlinx.browser.document
import kotlinx.browser.window
import org.jetbrains.compose.web.dom.*
import org.jetbrains.compose.web.renderComposable
import org.w3c.dom.HTMLElement

fun main() {
    // Check which page we're on based on URL
    val path = window.location.pathname

    if (path.contains("learn.html")) {
        // Cube page
        renderComposable(rootElementId = "root") {
            CubeApp()
        }
    } else {
        // Main page
        createParticles()
        renderComposable(rootElementId = "root") {
            App()
        }
    }
}

@Composable
fun App() {
    Div(attrs = {
        classes("container")
    }) {
        AppTitle()
        AppDescription()
        LinkedInButton()
        Text(" ")
        LearnButton()
    }
}

fun getAppTitleText(): String = "Hi I'm Allan"

@Composable
fun AppTitle() {
    H1 {
        Text(getAppTitleText())
    }
}

@Composable
fun AppDescription() {
    P {
        Text("contact me on linkedin")
    }
}

@Composable
fun LinkedInButton() {
    Button(attrs = {
        classes("linkedin-btn")
        onClick {
            window.open("https://www.linkedin.com/in/allan-pereira-abrahao/", "_blank")
        }
    }) {
        Text("LinkedIn")
    }
}

@Composable
fun LearnButton() {
    Button(attrs = {
        classes("learn-btn")
        onClick {
            window.location.href = "pages/learn/learn.html"
        }
    }) {
        Text("Learn Something")
    }
}

// Data models
data class MatrixColumn(
    val position: Int,
    val delay: Int,
    val duration: Int,
    val chars: List<MatrixChar>
)

data class MatrixChar(
    val character: String,
    val animationDelay: Int
)

data class MatrixConfig(
    val columns: List<MatrixColumn>,
    val charset: String = DEFAULT_CHARSET
)

const val DEFAULT_CHARSET = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"

// Pure functions that return data
fun calculateColumnPosition(index: Int): Int = (index * 3.33).toInt()

fun generateAnimationDelay(): Int = (0..3000).random()

fun generateAnimationDuration(): Int = (3000..6000).random()

fun createMatrixCharData(chars: String, index: Int): MatrixChar =
    MatrixChar(chars.random().toString(), index * 100)

fun createMatrixColumnData(index: Int, chars: String): MatrixColumn =
    MatrixColumn(
        position = calculateColumnPosition(index),
        delay = generateAnimationDelay(),
        duration = generateAnimationDuration(),
        chars = List((5..15).random()) { createMatrixCharData(chars, it) }
    )

fun generateMatrixConfig(columnCount: Int = 30, charset: String = DEFAULT_CHARSET): MatrixConfig =
    MatrixConfig(
        columns = List(columnCount) { createMatrixColumnData(it, charset) },
        charset = charset
    )

// DOM rendering functions
fun renderMatrixColumn(column: MatrixColumn, chars: String): HTMLElement {
    val elem = document.createElement("div") as HTMLElement
    elem.className = "matrix-column"
    elem.setAttribute("style",
        "left: ${column.position}%; animation-delay: ${column.delay}ms; animation-duration: ${column.duration}ms;")

    column.chars.forEach { charData ->
        elem.appendChild(renderMatrixChar(charData))
    }

    return elem
}

fun renderMatrixChar(charData: MatrixChar): HTMLElement {
    val elem = document.createElement("span") as HTMLElement
    elem.className = "matrix-char"
    elem.textContent = charData.character
    elem.setAttribute("style", "animation-delay: ${charData.animationDelay}ms;")
    return elem
}

fun createParticles() {
    val container = document.createElement("div") as HTMLElement
    container.className = "particles"
    container.id = "particles"
    document.body?.appendChild(container)

    val config = generateMatrixConfig()

    config.columns.forEach { column ->
        container.appendChild(renderMatrixColumn(column, config.charset))
    }

    startCharAnimation(config.charset)
}

fun startCharAnimation(chars: String) {
    window.setInterval({
        val elements = document.querySelectorAll(".matrix-char")
        for (i in 0 until elements.length) {
            if (kotlin.random.Random.nextDouble() < 0.1) {
                (elements.item(i) as? HTMLElement)?.textContent = chars.random().toString()
            }
        }
    }, 100)
}
