use yew::prelude::*;
use wasm_bindgen::prelude::*;
use web_sys::HtmlInputElement;

#[function_component]
pub fn App() -> Html {
    let input_ref = use_node_ref();
    let input_value = use_state(String::new);
    let output = use_state(|| vec!["Welcome to Rust Terminal!".to_string()]);
    
    let on_keypress = {
        let input_ref = input_ref.clone();
        let input_value = input_value.clone();
        let output = output.clone();
        
        Callback::from(move |e: KeyboardEvent| {
            if e.key() == "Enter" {
                let input = input_ref.cast::<HtmlInputElement>().unwrap();
                let cmd = input.value();
                
                let mut new_output = (*output).clone();
                new_output.push(format!("$ {}", cmd));
                new_output.push(format!("You typed: {}", cmd));
                
                output.set(new_output);
                input.set_value("");
                input_value.set(String::new());
            }
        })
    };

    html! {
        <div class="terminal">
            <div>
                { for output.iter().map(|line| html! { <div>{line}</div> }) }
            </div>
            <div>
                <span>{"$ "}</span>
                <input 
                    ref={input_ref}
                    type="text"
                    onkeypress={on_keypress}
                />
                <span class="cursor">{"_"}</span>
            </div>
        </div>
    }
}

#[wasm_bindgen(start)]
pub fn run_app() {
    yew::Renderer::<App>::new().render();
}