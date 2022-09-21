extends Position2D

onready var child = $Child

func _ready():
	print("canonical child local: ", child.position)
	print("canonical child global: ", child.global_position)
	print("computed child local: ", world_to_local(child.global_position))
	print("computed child global: ", local_to_world(child.position))
	pass

func world_to_local(vec: Vector2) -> Vector2:
	var translated_vec = vec - self.global_position
	
	var down = global_transform.basis_xform(Vector2.DOWN)
	var right = global_transform.basis_xform(Vector2.RIGHT)
	return Vector2(
		translated_vec.dot(right),
		translated_vec.dot(down)
	)
	
func local_to_world(vec: Vector2) -> Vector2:
	var global_parent_down = global_transform.basis_xform(Vector2.DOWN)
	var global_parent_right = global_transform.basis_xform(Vector2.RIGHT)
	var world_offset = global_parent_down * vec.y + global_parent_right * vec.x
	return world_offset + self.global_position

func local_to_world_dum(vec: Vector2) -> Vector2:
	var global_parent_down = global_transform.basis_xform(Vector2.DOWN)
	var global_parent_right = global_transform.basis_xform(Vector2.RIGHT)
	
	var world_down_local = Vector2(
		Vector2.DOWN.dot(global_parent_right),
		Vector2.DOWN.dot(global_parent_down)
	)
	var world_right_local = Vector2(
		Vector2.RIGHT.dot(global_parent_right),
		Vector2.RIGHT.dot(global_parent_down)
	)
	
	var rotated_vec = Vector2(
		vec.dot(world_right_local),
		vec.dot(world_down_local)
	)
	
	return rotated_vec + self.global_position
