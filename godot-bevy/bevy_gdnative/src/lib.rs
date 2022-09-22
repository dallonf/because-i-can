use bevy_app::BevyApp;
use gdnative::prelude::*;

mod bevy_app;
mod breakout;
mod gd_sync;

#[derive(NativeClass)]
#[inherit(Node)]
pub struct BevyHost {
    bevy_app: Option<BevyApp>,
}

impl BevyHost {
    fn new(_owner: &Node) -> Self {
        BevyHost { bevy_app: None }
    }
}

#[methods]
impl BevyHost {
    #[export]
    fn _ready(&mut self, _owner: &Node) {
        let mut bevy_app = BevyApp::new(unsafe { _owner.assume_shared() });
        bevy_app.update(0.0);
        self.bevy_app = Some(bevy_app)
    }

    #[export]
    fn _process(&mut self, _owner: &Node, delta: f32) {
        if let Some(bevy_app) = &mut self.bevy_app {
            bevy_app.update(delta);
        }
    }
}

#[derive(NativeClass)]
#[inherit(Node)]
pub struct HelloWorld;

impl HelloWorld {
    fn new(_owner: &Node) -> Self {
        HelloWorld
    }
}

#[methods]
impl HelloWorld {
    #[export]
    fn _ready(&mut self, _owner: &Node) {
        godot_print!("Hello world from Rust!");
    }
}

// Function that registers all exposed classes to Godot
fn init(handle: InitHandle) {
    handle.add_class::<HelloWorld>();
    handle.add_class::<BevyHost>();
}

// Macro that creates the entry-points of the dynamic library.
godot_init!(init);
