tool
extends Position2D

export var threshold = 1.0

onready var player = $Player

func _ready():
	pass
	
func _process(delta):
	update()

func _draw():
	var player_look_direction = player.transform.basis_xform(Vector2.UP)
	var direction_from_player_to_target = player.global_position.direction_to(self.global_position)
	var dot = direction_from_player_to_target.dot(player_look_direction)
	
	var color = Color.green if dot > threshold else Color.red
	
	draw_line(
		player.position,
		player.position + player_look_direction * player.global_position.distance_to(self.global_position), 
		color
	)
