# godot-bevy

An unhinged experiment to see if I can host a [Bevy](https://bevyengine.org/) game within Godot, using the latter as the rendering engine.

The result: sort of? It's a pain, though.

* `bevy_gdnative` - A GDNative extension that contains a Bevy app, basically a direct port of its Breakout example
  * You'll need to run `just build` in this directory before trying to run the below project
* `GodotBevyHostGame` - The Godot game that imports `bevy_gdnative`