tool
extends Node2D

export var radius = 100

onready var player = $Player

func _ready():
	pass
	
func _process(delta):
	update()
	
func _draw():
	var color = Color.green if is_in_bounds() else Color.red
	draw_arc(Vector2.ZERO, radius, 0, TAU, 360, color)

func is_in_bounds() -> bool:
	var diff = player.global_position - self.global_position
	return diff.length() < radius
