# GMTK Jam Prep 2022

I thought I was going to use Godot for the 2022 GMTK Game Jam, so I did a few exercises in Godot 3.4:

* `Scene.tscn` - Two very basic character controllers
    * a "speedrun" of making a functioning character controller in Godot.
    * Also includes a VisualScript port of the controller, in which I discovered, [followed shortly by the Godot core team](https://godotengine.org/article/godot-4-will-discontinue-visual-scripting), that Godot's visual scripting is not good enough to justify its existence.
* `MeanwhileUtils` - A speculative port of some common utilities I typically copy into all my Unity projects.
* `Math` - Following along with [Freya Holmer's "Math For Game Devs" series on YouTube](https://www.youtube.com/watch?v=MOYiVLEnhrwc). I only did the 2D exercises in Godot, since they rely heavily on Unity's `Gizmos` and `Debug.DrawLine` utilities, which Godot doesn't have an equivalent for in 3D (at time of writing)