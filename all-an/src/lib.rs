use wasm_bindgen::prelude::*;

mod particles;
pub use particles::*;

#[wasm_bindgen]
pub fn hello_world() -> String {
    String::from("Hello, world from Rust WASM!")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hello_world() {
        assert_eq!(hello_world(), "Hello, world from Rust WASM!");
    }
}
