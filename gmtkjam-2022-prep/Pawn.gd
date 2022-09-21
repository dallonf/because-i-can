extends KinematicBody2D

const SPEED = 500

func _ready():
	pass

func _physics_process(delta):
	var horizontal = Input.get_axis("move_left", "move_right")
	var vertical = Input.get_axis("move_up", "move_down")
	var movement = Vector2(horizontal, vertical)
	if movement.length() > 1:
		movement = movement.normalized()
	
	self.move_and_slide(movement * SPEED)
