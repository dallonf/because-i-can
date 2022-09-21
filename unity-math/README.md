# unity-math

This is from following along with [Freya Holmer's "Math For Game Devs" series on YouTube](https://www.youtube.com/watch?v=MOYiVLEnhrwc). But anything that could be done in 2D, I pretty much did in its [Godot componanion](../gmtkjam-2022-prep/).

* `Coil` - Select the `Coil` GameObject to see a wireframe coil in the Scene View. Neat!
* `AdaptiveCamera`
  * Move the main camera around - you'll see it adjusts its distance to keep all the bounding spheres within view.
  * Then disable the `AdaptiveCameraDistance` script and instead enable the `AdaptiveCamera` script, and it will do the same, but adjust the FOV instead of distance.