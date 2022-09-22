use bevy::{app::ScheduleRunnerSettings, prelude::*};
use gdnative::object::Ref;

use crate::{
    breakout::BreakoutPlugin,
    gd_sync::{GDParentNode, GDSyncPlugin},
};

pub struct BevyApp {
    app: App,
}

pub struct GodotTime {
    delta: f32,
}

impl GodotTime {
    fn from_delta(delta: f32) -> Self {
        GodotTime { delta }
    }

    pub fn delta(&self) -> f32 {
        return self.delta;
    }
}

impl BevyApp {
    pub fn new(owner_node: Ref<gdnative::api::Node>) -> Self {
        let mut app = App::new();
        app.add_plugins(MinimalPlugins)
            .add_plugin(GDSyncPlugin)
            .add_plugin(BreakoutPlugin)
            .insert_resource(ScheduleRunnerSettings {
                run_mode: bevy::app::RunMode::Once,
            })
            .insert_resource(GDParentNode(owner_node));
        BevyApp { app }
    }

    pub fn update(&mut self, delta: f32) {
        self.app.insert_resource(GodotTime::from_delta(delta));
        self.app.update();
    }
}
