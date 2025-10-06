use wasm_bindgen::prelude::*;
use rand::Rng;
use web_sys::{Document, HtmlElement, Window};
use wasm_bindgen::JsCast;

// Default charset matching Kotlin implementation
pub const DEFAULT_CHARSET: &str = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

// Data structure for a single matrix character
// Kotlin equivalent: data class MatrixChar(val character: String, val animationDelay: Int)
#[wasm_bindgen]
#[derive(Clone, Debug, PartialEq)]
pub struct MatrixChar {
    character: String,
    animation_delay: i32,
}

#[wasm_bindgen]
impl MatrixChar {
    #[wasm_bindgen(getter)]
    pub fn character(&self) -> String {
        self.character.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn animation_delay(&self) -> i32 {
        self.animation_delay
    }
}

// Data structure for a matrix column
// Kotlin equivalent: data class MatrixColumn(val position: Int, val delay: Int, val duration: Int, val chars: List<MatrixChar>)
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct MatrixColumn {
    position: i32,
    delay: i32,
    duration: i32,
    chars: Vec<MatrixChar>,
}

#[wasm_bindgen]
impl MatrixColumn {
    #[wasm_bindgen(getter)]
    pub fn position(&self) -> i32 {
        self.position
    }

    #[wasm_bindgen(getter)]
    pub fn delay(&self) -> i32 {
        self.delay
    }

    #[wasm_bindgen(getter)]
    pub fn duration(&self) -> i32 {
        self.duration
    }

    #[wasm_bindgen(getter)]
    pub fn chars(&self) -> Vec<MatrixChar> {
        self.chars.clone()
    }
}

// Create a MatrixChar with random character from charset
// Kotlin equivalent: fun createMatrixCharData(chars: String, index: Int): MatrixChar
#[wasm_bindgen]
pub fn create_matrix_char_data(chars: &str, index: i32) -> MatrixChar {
    let mut rng = rand::thread_rng();
    let chars_vec: Vec<char> = chars.chars().collect();
    let random_char = chars_vec[rng.gen_range(0..chars_vec.len())];

    MatrixChar {
        character: random_char.to_string(),
        animation_delay: index * 100,
    }
}

// Create a MatrixColumn with random properties
// Kotlin equivalent: fun createMatrixColumnData(index: Int, chars: String): MatrixColumn
#[wasm_bindgen]
pub fn create_matrix_column_data(index: i32, chars: &str) -> MatrixColumn {
    let mut rng = rand::thread_rng();
    let char_count = rng.gen_range(5..=15);

    let chars_vec: Vec<MatrixChar> = (0..char_count)
        .map(|i| create_matrix_char_data(chars, i))
        .collect();

    MatrixColumn {
        position: calculate_column_position(index),
        delay: generate_animation_delay(),
        duration: generate_animation_duration(),
        chars: chars_vec,
    }
}

// Data structure for matrix configuration
// Kotlin equivalent: data class MatrixConfig(val columns: List<MatrixColumn>, val charset: String)
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct MatrixConfig {
    columns: Vec<MatrixColumn>,
    charset: String,
}

#[wasm_bindgen]
impl MatrixConfig {
    #[wasm_bindgen(getter)]
    pub fn columns(&self) -> Vec<MatrixColumn> {
        self.columns.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn charset(&self) -> String {
        self.charset.clone()
    }
}

// Generate complete matrix configuration
// Kotlin equivalent: fun generateMatrixConfig(columnCount: Int = 30, charset: String = DEFAULT_CHARSET): MatrixConfig
#[wasm_bindgen]
pub fn generate_matrix_config(column_count: i32, charset: &str) -> MatrixConfig {
    let columns: Vec<MatrixColumn> = (0..column_count)
        .map(|i| create_matrix_column_data(i, charset))
        .collect();

    MatrixConfig {
        columns,
        charset: charset.to_string(),
    }
}

// Helper function with default parameters
#[wasm_bindgen]
pub fn generate_matrix_config_default() -> MatrixConfig {
    generate_matrix_config(30, DEFAULT_CHARSET)
}

// DOM Rendering Functions - Pure logic functions

// Generate CSS style string for a MatrixChar
// This is a pure function that can be tested without DOM
pub fn generate_char_style(animation_delay: i32) -> String {
    format!("animation-delay: {}ms;", animation_delay)
}

// Generate CSS style string for a MatrixColumn
// This is a pure function that can be tested without DOM
pub fn generate_column_style(position: i32, delay: i32, duration: i32) -> String {
    format!(
        "left: {}%; animation-delay: {}ms; animation-duration: {}ms;",
        position, delay, duration
    )
}

// Get the window object
fn window() -> Result<Window, JsValue> {
    web_sys::window().ok_or_else(|| JsValue::from_str("no window found"))
}

// Get the document object
fn document() -> Result<Document, JsValue> {
    window()?
        .document()
        .ok_or_else(|| JsValue::from_str("no document found"))
}

// Render a MatrixChar as an HTML span element
// Kotlin equivalent: fun renderMatrixChar(charData: MatrixChar): HTMLElement
#[wasm_bindgen]
pub fn render_matrix_char(char_data: &MatrixChar) -> Result<HtmlElement, JsValue> {
    let doc = document()?;
    let elem = doc.create_element("span")?;
    let html_elem = elem.dyn_into::<HtmlElement>()?;

    html_elem.set_class_name("matrix-char");
    html_elem.set_text_content(Some(&char_data.character()));

    let style = generate_char_style(char_data.animation_delay());
    html_elem.set_attribute("style", &style)?;

    Ok(html_elem)
}

// Render a MatrixColumn as an HTML div element containing char spans
// Kotlin equivalent: fun renderMatrixColumn(column: MatrixColumn, chars: String): HTMLElement
#[wasm_bindgen]
pub fn render_matrix_column(column: &MatrixColumn) -> Result<HtmlElement, JsValue> {
    let doc = document()?;
    let elem = doc.create_element("div")?;
    let html_elem = elem.dyn_into::<HtmlElement>()?;

    html_elem.set_class_name("matrix-column");

    let style = generate_column_style(column.position(), column.delay(), column.duration());
    html_elem.set_attribute("style", &style)?;

    // Append all characters as child elements
    for char_data in column.chars() {
        let char_elem = render_matrix_char(&char_data)?;
        html_elem.append_child(&char_elem)?;
    }

    Ok(html_elem)
}

// Create particles container and render all columns
// Kotlin equivalent: fun createParticles()
#[wasm_bindgen]
pub fn create_particles() -> Result<(), JsValue> {
    let doc = document()?;
    let body = doc.body().ok_or_else(|| JsValue::from_str("no body found"))?;

    // Create container div
    let container = doc.create_element("div")?;
    let html_container = container.dyn_into::<HtmlElement>()?;
    html_container.set_class_name("particles");
    html_container.set_id("particles");

    // Generate matrix config
    let config = generate_matrix_config_default();

    // Render all columns and append to container
    for column in config.columns() {
        let column_elem = render_matrix_column(&column)?;
        html_container.append_child(&column_elem)?;
    }

    // Append container to body
    body.append_child(&html_container)?;

    // Start character animation
    start_char_animation(DEFAULT_CHARSET)?;

    Ok(())
}

// Pure function to get a random character from charset
pub fn get_random_char(chars: &str) -> Option<String> {
    let chars_vec: Vec<char> = chars.chars().collect();
    if chars_vec.is_empty() {
        return None;
    }
    let mut rng = rand::thread_rng();
    let random_char = chars_vec[rng.gen_range(0..chars_vec.len())];
    Some(random_char.to_string())
}

// Pure function to check if character should change (10% probability)
pub fn should_change_char() -> bool {
    let mut rng = rand::thread_rng();
    rng.gen::<f64>() < 0.1
}

// Update a single matrix character element with random character
fn update_char_element(elem: &web_sys::Node, charset: &str) {
    if let Ok(html_elem) = elem.dyn_ref::<HtmlElement>().ok_or("not html element") {
        if let Some(new_char) = get_random_char(charset) {
            html_elem.set_text_content(Some(&new_char));
        }
    }
}

// Start animation that randomly changes characters
// Kotlin equivalent: fun startCharAnimation(chars: String)
#[wasm_bindgen]
pub fn start_char_animation(charset: &str) -> Result<(), JsValue> {
    let win = window()?;
    let charset_owned = charset.to_string();

    let callback = Closure::wrap(Box::new(move || {
        let doc = match document() {
            Ok(d) => d,
            Err(_) => return,
        };

        let elements = match doc.query_selector_all(".matrix-char") {
            Ok(e) => e,
            Err(_) => return,
        };

        for i in 0..elements.length() {
            if should_change_char() {
                if let Some(elem) = elements.item(i) {
                    update_char_element(&elem, &charset_owned);
                }
            }
        }
    }) as Box<dyn FnMut()>);

    win.set_interval_with_callback_and_timeout_and_arguments_0(
        callback.as_ref().unchecked_ref(),
        100
    )?;

    callback.forget();

    Ok(())
}

// Particle system - Pure function to calculate column position
// Kotlin equivalent: fun calculateColumnPosition(index: Int): Int = (index * 3.33).toInt()
#[wasm_bindgen]
pub fn calculate_column_position(index: i32) -> i32 {
    (index as f64 * 3.33) as i32
}

// Generate random animation delay between 0 and 3000ms
// Kotlin equivalent: fun generateAnimationDelay(): Int = (0..3000).random()
#[wasm_bindgen]
pub fn generate_animation_delay() -> i32 {
    let mut rng = rand::thread_rng();
    rng.gen_range(0..=3000)
}

// Generate random animation duration between 3000 and 6000ms
// Kotlin equivalent: fun generateAnimationDuration(): Int = (3000..6000).random()
#[wasm_bindgen]
pub fn generate_animation_duration() -> i32 {
    let mut rng = rand::thread_rng();
    rng.gen_range(3000..=6000)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_column_position_zero() {
        assert_eq!(calculate_column_position(0), 0);
    }

    #[test]
    fn test_calculate_column_position_one() {
        assert_eq!(calculate_column_position(1), 3);
    }

    #[test]
    fn test_calculate_column_position_multiple() {
        assert_eq!(calculate_column_position(5), 16);
        assert_eq!(calculate_column_position(10), 33);
        assert_eq!(calculate_column_position(29), 96);
    }

    #[test]
    fn test_generate_animation_delay_range() {
        for _ in 0..100 {
            let delay = generate_animation_delay();
            assert!(delay >= 0 && delay <= 3000, "delay {} out of range [0, 3000]", delay);
        }
    }

    #[test]
    fn test_generate_animation_duration_range() {
        for _ in 0..100 {
            let duration = generate_animation_duration();
            assert!(duration >= 3000 && duration <= 6000, "duration {} out of range [3000, 6000]", duration);
        }
    }

    #[test]
    fn test_create_matrix_char_data_delay() {
        let char_data = create_matrix_char_data("01", 0);
        assert_eq!(char_data.animation_delay(), 0);

        let char_data = create_matrix_char_data("01", 5);
        assert_eq!(char_data.animation_delay(), 500);

        let char_data = create_matrix_char_data("01", 10);
        assert_eq!(char_data.animation_delay(), 1000);
    }

    #[test]
    fn test_create_matrix_char_data_character() {
        for _ in 0..50 {
            let char_data = create_matrix_char_data("01", 0);
            let ch = char_data.character();
            assert!(ch == "0" || ch == "1", "unexpected character: {}", ch);
        }
    }

    #[test]
    fn test_create_matrix_char_data_japanese() {
        let char_data = create_matrix_char_data(DEFAULT_CHARSET, 3);
        assert_eq!(char_data.animation_delay(), 300);
        assert!(!char_data.character().is_empty());
    }

    #[test]
    fn test_create_matrix_column_data_position() {
        let column = create_matrix_column_data(10, "01");
        assert_eq!(column.position(), 33); // 10 * 3.33 = 33
    }

    #[test]
    fn test_create_matrix_column_data_delay_duration() {
        let column = create_matrix_column_data(5, "01");
        let delay = column.delay();
        let duration = column.duration();

        assert!(delay >= 0 && delay <= 3000, "delay {} out of range", delay);
        assert!(duration >= 3000 && duration <= 6000, "duration {} out of range", duration);
    }

    #[test]
    fn test_create_matrix_column_data_chars_count() {
        for _ in 0..20 {
            let column = create_matrix_column_data(0, "01");
            let char_count = column.chars().len();
            assert!(char_count >= 5 && char_count <= 15, "char count {} out of range [5, 15]", char_count);
        }
    }

    #[test]
    fn test_create_matrix_column_data_chars_content() {
        let column = create_matrix_column_data(0, "ABC");
        let chars = column.chars();

        assert!(!chars.is_empty());
        for (i, char_data) in chars.iter().enumerate() {
            let ch = char_data.character();
            assert!(ch == "A" || ch == "B" || ch == "C", "unexpected character: {}", ch);
            assert_eq!(char_data.animation_delay(), i as i32 * 100);
        }
    }

    #[test]
    fn test_generate_matrix_config_column_count() {
        let config = generate_matrix_config(10, "01");
        assert_eq!(config.columns().len(), 10);

        let config = generate_matrix_config(30, "01");
        assert_eq!(config.columns().len(), 30);
    }

    #[test]
    fn test_generate_matrix_config_charset() {
        let config = generate_matrix_config(5, "XYZ");
        assert_eq!(config.charset(), "XYZ");
    }

    #[test]
    fn test_generate_matrix_config_default() {
        let config = generate_matrix_config_default();
        assert_eq!(config.columns().len(), 30);
        assert_eq!(config.charset(), DEFAULT_CHARSET);
    }

    #[test]
    fn test_generate_matrix_config_columns_valid() {
        let config = generate_matrix_config(5, "ABC");
        let columns = config.columns();

        assert_eq!(columns.len(), 5);

        for (i, column) in columns.iter().enumerate() {
            // Check position matches index
            assert_eq!(column.position(), calculate_column_position(i as i32));

            // Check delay and duration ranges
            assert!(column.delay() >= 0 && column.delay() <= 3000);
            assert!(column.duration() >= 3000 && column.duration() <= 6000);

            // Check chars count
            assert!(column.chars().len() >= 5 && column.chars().len() <= 15);
        }
    }

    // Tests for pure style generation functions (no DOM required)
    #[test]
    fn test_generate_char_style() {
        assert_eq!(generate_char_style(0), "animation-delay: 0ms;");
        assert_eq!(generate_char_style(500), "animation-delay: 500ms;");
        assert_eq!(generate_char_style(1000), "animation-delay: 1000ms;");
    }

    #[test]
    fn test_generate_column_style() {
        let style = generate_column_style(33, 1500, 4500);
        assert_eq!(style, "left: 33%; animation-delay: 1500ms; animation-duration: 4500ms;");

        let style = generate_column_style(0, 0, 3000);
        assert_eq!(style, "left: 0%; animation-delay: 0ms; animation-duration: 3000ms;");
    }

    #[test]
    fn test_generate_column_style_with_real_data() {
        let column = create_matrix_column_data(10, "01");
        let style = generate_column_style(column.position(), column.delay(), column.duration());

        assert!(style.contains(&format!("left: {}%", column.position())));
        assert!(style.contains(&format!("animation-delay: {}ms", column.delay())));
        assert!(style.contains(&format!("animation-duration: {}ms", column.duration())));
    }

    #[test]
    fn test_create_particles_logic() {
        // Test that we can generate the config that create_particles would use
        let config = generate_matrix_config_default();

        // Verify it has 30 columns
        assert_eq!(config.columns().len(), 30);

        // Verify all columns are valid
        for column in config.columns() {
            assert!(column.chars().len() >= 5 && column.chars().len() <= 15);
            assert!(column.delay() >= 0 && column.delay() <= 3000);
            assert!(column.duration() >= 3000 && column.duration() <= 6000);
        }
    }

    #[test]
    fn test_get_random_char() {
        // Test with simple charset
        for _ in 0..50 {
            let ch = get_random_char("AB").unwrap();
            assert!(ch == "A" || ch == "B", "unexpected character: {}", ch);
        }
    }

    #[test]
    fn test_get_random_char_empty() {
        assert_eq!(get_random_char(""), None);
    }

    #[test]
    fn test_get_random_char_single() {
        let ch = get_random_char("X").unwrap();
        assert_eq!(ch, "X");
    }

    #[test]
    fn test_get_random_char_japanese() {
        for _ in 0..20 {
            let ch = get_random_char(DEFAULT_CHARSET);
            assert!(ch.is_some());
            assert!(!ch.unwrap().is_empty());
        }
    }

    #[test]
    fn test_should_change_char_probability() {
        // Run many times to test probability is roughly 10%
        let mut count = 0;
        let iterations = 1000;

        for _ in 0..iterations {
            if should_change_char() {
                count += 1;
            }
        }

        // Should be approximately 10% (allow 5%-15% range for randomness)
        let percentage = (count as f64 / iterations as f64) * 100.0;
        assert!(percentage >= 5.0 && percentage <= 15.0,
                "Expected ~10% probability, got {}%", percentage);
    }
}
