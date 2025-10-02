import androidx.compose.runtime.*
import kotlinx.browser.document
import kotlinx.browser.window
import org.jetbrains.compose.web.dom.*
import org.jetbrains.compose.web.renderComposable
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun CubeApp() {
    Div(attrs = {
        classes("container")
    }) {
        BackButton()
        CubeTitle()
        CubeDescription()
        CubeContainer()
    }

    LaunchedEffect(Unit) {
        enhanceCubeColors()
        animateCube()
    }
}

@Composable
fun BackButton() {
    Button(attrs = {
        classes("back-btn")
        onClick {
            window.location.href = "../../index.html"
        }
    }) {
        Text("← Back")
    }
}

@Composable
fun CubeTitle() {
    H1 {
        Text("3D Cube Demo")
    }
}

@Composable
fun CubeDescription() {
    P {
        Text("A rotating 3D cube generated with Kotlin")
    }
}

@Composable
fun CubeContainer() {
    Div(attrs = {
        id("cube-container")
    }) {
        Div(attrs = {
            classes("cube")
            id("cube")
        }) {
            Div(attrs = { classes("face", "front") })
            Div(attrs = { classes("face", "back") })
            Div(attrs = { classes("face", "right") })
            Div(attrs = { classes("face", "left") })
            Div(attrs = { classes("face", "top") })
            Div(attrs = { classes("face", "bottom") })
        }
    }
}

data class Vec3(val x: Double, val y: Double, val z: Double)

class Cube3D {
    var rotationX = 0.0
    var rotationY = 0.0
    var rotationZ = 0.0

    fun rotateX(v: Vec3, angle: Double): Vec3 {
        val cosA = cos(angle)
        val sinA = sin(angle)
        return Vec3(
            x = v.x,
            y = v.y * cosA - v.z * sinA,
            z = v.y * sinA + v.z * cosA
        )
    }

    fun rotateY(v: Vec3, angle: Double): Vec3 {
        val cosA = cos(angle)
        val sinA = sin(angle)
        return Vec3(
            x = v.x * cosA + v.z * sinA,
            y = v.y,
            z = -v.x * sinA + v.z * cosA
        )
    }

    fun rotateZ(v: Vec3, angle: Double): Vec3 {
        val cosA = cos(angle)
        val sinA = sin(angle)
        return Vec3(
            x = v.x * cosA - v.y * sinA,
            y = v.x * sinA + v.y * cosA,
            z = v.z
        )
    }

    fun updateCube() {
        rotationX += 0.04
        rotationY += 0.08
        rotationZ += 0.02

        val cubeElement = document.getElementById("cube")
        cubeElement?.let {
            val transform = "rotateX(${rotationX * 57.2958}deg) rotateY(${rotationY * 57.2958}deg) rotateZ(${rotationZ * 57.2958}deg)"
            it.setAttribute("style", "transform: $transform")
        }
    }
}

val cube = Cube3D()

fun enhanceCubeColors() {
    val faces = document.querySelectorAll(".face")
    val colors = arrayOf(
        "rgba(255, 99, 132, 0.3)",   // front - red
        "rgba(54, 162, 235, 0.3)",   // back - blue
        "rgba(255, 205, 86, 0.3)",   // right - yellow
        "rgba(75, 192, 192, 0.3)",   // left - teal
        "rgba(153, 102, 255, 0.3)",  // top - purple
        "rgba(255, 159, 64, 0.3)"    // bottom - orange
    )

    for (i in 0 until minOf(6, faces.length.toInt())) {
        val face = faces.item(i) as? org.w3c.dom.HTMLElement
        face?.style?.backgroundColor = colors[i]
    }
}

fun animateCube() {
    cube.updateCube()
    window.requestAnimationFrame { animateCube() }
}
