use bevy::{prelude::*, utils::HashMap};
use gdnative::{
    api::Node,
    object::Ref,
    prelude::{godot_print, godot_warn},
};

pub struct GDParentNode(pub Ref<Node>);

#[derive(Component, Default)]
pub struct GDSprite {
    pub color: Color,
    pub z_index: i64,
}

#[derive(Component)]
struct GDSpriteInstance {
    sprite: Ref<gdnative::api::Sprite>,
}

#[derive(Component, Default)]
pub struct GD2DTransform {
    pub position: Vec2,
    pub rotation: f32,
    pub scale: Vec2,
}

#[derive(Bundle, Default)]
pub struct GDSpriteBundle {
    pub transform: GD2DTransform,
    pub sprite: GDSprite,
}

pub struct GDSyncPlugin;
impl Plugin for GDSyncPlugin {
    fn build(&self, app: &mut App) {
        app.add_system_to_stage(CoreStage::Last, add_sprites.before(update_sprites))
            .add_system_to_stage(CoreStage::Last, update_sprites)
            .add_system_to_stage(CoreStage::Last, track_sprites);
    }
}

fn add_sprites(
    query: Query<(Entity, &GDSprite), Without<GDSpriteInstance>>,
    node: NonSend<GDParentNode>,
    mut commands: Commands,
) {
    let node = unsafe { node.0.assume_safe_if_sane().unwrap() };
    let resource_loader = gdnative::api::ResourceLoader::godot_singleton();
    let box_tex = resource_loader
        .load("res://box.png", "", false)
        .and_then(|it| it.cast::<gdnative::api::Texture>())
        .unwrap();
    for (entity, _) in query.iter() {
        let sprite = gdnative::api::Sprite::new();
        sprite.set_texture(&box_tex);
        sprite.set_name(format!("Entity {}", entity.id()));

        let sprite = sprite.into_shared();
        node.add_child(&sprite, false);

        commands
            .entity(entity)
            .insert(GDSpriteInstance { sprite: sprite });
    }
}

fn update_sprites(
    _: NonSend<GDParentNode>,
    query: Query<
        (&GDSpriteInstance, &GDSprite, &GD2DTransform),
        Or<(
            Added<GDSpriteInstance>,
            Changed<GDSprite>,
            Changed<GD2DTransform>,
        )>,
    >,
) {
    for (sprite_instance, sprite, transform) in query.iter() {
        let sprite_instance: &GDSpriteInstance = sprite_instance;
        let sprite: &GDSprite = sprite;
        let transform: &GD2DTransform = transform;

        let sprite_instance = unsafe { sprite_instance.sprite.assume_safe() };
        sprite_instance.set_position(bevy_to_gd_vector2(transform.position));
        sprite_instance.set_rotation(transform.rotation.into());
        sprite_instance.set_scale(bevy_to_gd_vector2(transform.scale));
        sprite_instance.set_z_index(sprite.z_index);
        sprite_instance.set_modulate(bevy_to_gd_color(sprite.color));
    }
}

#[derive(Default)]
struct TrackedSprites(HashMap<Entity, Ref<gdnative::api::Sprite>>);

// perf win: it would probably be better to ask systems that despawn a sprite to
// also trigger an event, but hard to enforce
fn track_sprites(query: Query<(Entity, &GDSpriteInstance)>, mut tracked: Local<TrackedSprites>) {
    let mut next_tracked = HashMap::new();
    for (entity, sprite) in query.iter() {
        next_tracked.insert(entity, sprite.sprite);
    }

    for (entity, sprite) in tracked.0.iter() {
        if !next_tracked.contains_key(entity) {
            let sprite = unsafe { sprite.assume_safe() };
            sprite.queue_free();
        }
    }
    *tracked = TrackedSprites(next_tracked);
}

fn bevy_to_gd_vector2(input: Vec2) -> gdnative::core_types::Vector2 {
    gdnative::core_types::Vector2::new(input.x, input.y)
}

fn bevy_to_gd_color(input: Color) -> gdnative::core_types::Color {
    gdnative::core_types::Color::from_rgba(input.r(), input.g(), input.b(), input.a())
}
