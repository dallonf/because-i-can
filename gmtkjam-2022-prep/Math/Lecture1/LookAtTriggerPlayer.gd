tool
extends Position2D


func _ready():
	pass
	
func _draw():
	draw_line(Vector2.ZERO, Vector2.UP * 20, Color.white)
