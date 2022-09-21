tool
extends Node2D

export var sides = 2
export var density = 1
export var radius = 100.0

onready var label: Label = $Label

var points = []

func _process(delta):
	if Engine.editor_hint:
		label = $Label
	
	points = []
	
	var starting_angle = 0
	for i in range(sides):
		var percentage_of_circle = i / float(sides)
		var direction = Vector2(
			cos((starting_angle + percentage_of_circle) * TAU),
			sin((starting_angle + percentage_of_circle) * TAU)
		)
		var point = direction * radius
		points.append(point)

	if density == 1:
		var angle_between_points = TAU / float(sides)
		var half_angle = angle_between_points / 2
		
		# var side_midpoint: Vector2 = (points[0] + points[1])/2
		# var apothem = side_midpoint.length()
		var apothem = cos(half_angle) * radius
		
		var half_side_length = sin(half_angle) * radius
		var side_length = half_side_length * 2
		var perimeter = side_length * sides
		
		var area = (perimeter * apothem) / 2
		label.show()
		label.text = "Area: %s" % area
	else:
		label.hide()
		
	update()
	
func _draw():	
	for i in range(points.size()):
		var point = points[i]
		var next_point = points[(i + density) % points.size()]
		draw_line(point, next_point, Color.white)
	
	for point in points:
		draw_circle(point, 5, Color.red)
