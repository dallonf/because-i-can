-- title:   game title
-- author:  game developer, email, etc.
-- desc:    short description
-- site:    website link
-- license: MIT License (change this to your license of choice)
-- version: 0.1
-- script:  lua

require("src/moremath")

ROTATION_TIME = 600

DRAW_SIZE = 32
HALF_DRAW_SIZE = DRAW_SIZE/2
SCREEN_OFFSET = 10
TAU = math.pi*2

DISTANCE_FROM_CENTER_OF_CUBE_TO_EDGE = 0.5
ANGLE_FROM_CENTER_OF_CUBE_TO_CORNER = TAU/8

CAMERA_CENTER_ON_SCREEN = {32, 32}

FRONT_FACE_TOP_CORNER = {-1, -1}
FRONT_FACE_BOTTOM_CORNER = {-1, 1}
BOTTOM_FACE_BACK_CORNER = {1, 1}

function draw3DSprite(leftX, topY, rightX, bottomY)
	ttri(
		-- coordinates
		leftX, bottomY,
		leftX, topY,
		rightX, topY,
		-- uv
		0, 128+16,
		0, 128,
		0+16, 128,
		-- don't use map
		false
)
ttri(
		-- coordinates
		leftX, bottomY,
		rightX, topY,
		rightX, bottomY,
		-- uv
		0, 128+16,
		0+16, 128,
		0+16, 128+16,
		-- don't use map
		false
)
end

function TIC()
	cls(0)

	local turnAngle = moremath.remap(0, ROTATION_TIME, 0, TAU/4, time() % ROTATION_TIME)
	-- local turnAngle = 0
	-- local turnAngle = (45 / 360) * TAU
	print("" .. (turnAngle / TAU * 360), 0, 0, 12)

	local currentAngleDirY = math.sin(turnAngle)
	local currentAngleCrossDirY = math.cos(turnAngle)
	
	local frontFaceTopEdgeY = (currentAngleDirY * FRONT_FACE_TOP_CORNER[1] + currentAngleCrossDirY * FRONT_FACE_TOP_CORNER[2]) * HALF_DRAW_SIZE;
	local frontFaceBottomEdgeY = (currentAngleDirY * FRONT_FACE_BOTTOM_CORNER[1] + currentAngleCrossDirY * FRONT_FACE_BOTTOM_CORNER[2]) * HALF_DRAW_SIZE;
	local bottomFaceBackEdgeY = (currentAngleDirY * BOTTOM_FACE_BACK_CORNER[1] + currentAngleCrossDirY * BOTTOM_FACE_BACK_CORNER[2]) * HALF_DRAW_SIZE;

	draw3DSprite(
		CAMERA_CENTER_ON_SCREEN[1] - HALF_DRAW_SIZE, CAMERA_CENTER_ON_SCREEN[2] + frontFaceTopEdgeY,
		CAMERA_CENTER_ON_SCREEN[1] + HALF_DRAW_SIZE, CAMERA_CENTER_ON_SCREEN[2] + frontFaceBottomEdgeY
	)
	draw3DSprite(
		CAMERA_CENTER_ON_SCREEN[1] - HALF_DRAW_SIZE, CAMERA_CENTER_ON_SCREEN[2] + frontFaceBottomEdgeY,
		CAMERA_CENTER_ON_SCREEN[1] + HALF_DRAW_SIZE, CAMERA_CENTER_ON_SCREEN[2] + bottomFaceBackEdgeY
	)


	-- ttri(
	-- 	-- coordinates
	-- 	CAMERA_CENTER_ON_SCREEN[1] - HALF_DRAW_SIZE, CAMERA_CENTER_ON_SCREEN[2] + frontFaceTopEdgeY,
	-- 	CAMERA_CENTER_ON_SCREEN[1] - HALF_DRAW_SIZE,  CAMERA_CENTER_ON_SCREEN[2] + frontFaceBottomEdgeY,
	-- 	CAMERA_CENTER_ON_SCREEN[1] + HALF_DRAW_SIZE, CAMERA_CENTER_ON_SCREEN[2] + frontFaceTopEdgeY,
	-- 	-- uv
	-- 	0, 128,
	-- 	0, 128+16,
	-- 	0+16, 128,
	-- 	-- don't use map
	-- 	false,
	-- 	5
	-- )
	-- ttri(
	-- 	-- coordinates
	-- 	SCREEN_OFFSET, front_face_offset_y + SCREEN_OFFSET + front_face_draw_size_y,
	-- 	SCREEN_OFFSET + DRAW_SIZE, front_face_offset_y + SCREEN_OFFSET,
	-- 	SCREEN_OFFSET + DRAW_SIZE, front_face_offset_y + SCREEN_OFFSET + front_face_draw_size_y,
	-- 	-- uv
	-- 	0, 128+16,
	-- 	0+16, 128,
	-- 	0+16, 128+16,
	-- 	-- don't use map
	-- 	false,
	-- 	5
	-- )

	-- -- top face
	-- local top_face_draw_size_y = math.sin(turnAngle) * DRAW_SIZE
	-- local top_face_offset_y = 0
	-- ttri(
	-- 	-- coordinates
	-- 	SCREEN_OFFSET, top_face_offset_y + SCREEN_OFFSET,
	-- 	SCREEN_OFFSET, top_face_offset_y + SCREEN_OFFSET + top_face_draw_size_y,
	-- 	SCREEN_OFFSET + DRAW_SIZE, top_face_offset_y + SCREEN_OFFSET,
	-- 	-- uv
	-- 	0, 128,
	-- 	0, 128+16,
	-- 	0+16, 128,
	-- 	-- don't use map
	-- 	false,
	-- 	5
	-- )
	-- ttri(
	-- 	-- coordinates
	-- 	SCREEN_OFFSET, top_face_offset_y + SCREEN_OFFSET + top_face_draw_size_y,
	-- 	SCREEN_OFFSET + DRAW_SIZE, top_face_offset_y + SCREEN_OFFSET,
	-- 	SCREEN_OFFSET + DRAW_SIZE, top_face_offset_y + SCREEN_OFFSET + front_face_draw_size_y,
	-- 	-- uv
	-- 	0, 128+16,
	-- 	0+16, 128,
	-- 	0+16, 128+16,
	-- 	-- don't use map
	-- 	false,
	-- 	5
	-- )
end

-- <TILES>
-- 001:eccccccccc888888caaaaaaaca888888cacccccccacc0ccccacc0ccccacc0ccc
-- 002:ccccceee8888cceeaaaa0cee888a0ceeccca0ccc0cca0c0c0cca0c0c0cca0c0c
-- 003:eccccccccc888888caaaaaaaca888888cacccccccacccccccacc0ccccacc0ccc
-- 004:ccccceee8888cceeaaaa0cee888a0ceeccca0cccccca0c0c0cca0c0c0cca0c0c
-- 017:cacccccccaaaaaaacaaacaaacaaaaccccaaaaaaac8888888cc000cccecccccec
-- 018:ccca00ccaaaa0ccecaaa0ceeaaaa0ceeaaaa0cee8888ccee000cceeecccceeee
-- 019:cacccccccaaaaaaacaaacaaacaaaaccccaaaaaaac8888888cc000cccecccccec
-- 020:ccca00ccaaaa0ccecaaa0ceeaaaa0ceeaaaa0cee8888ccee000cceeecccceeee
-- </TILES>

-- <SPRITES>
-- 000:ddccccccdcccccccccccccccccc00cccccc00cccccccccccccccccccccc00ccc
-- 001:ccccccddcccccccdccccccccccc00cccccc00cccccccccccccccccccccc00ccc
-- 016:ccc00cccccccccccccccccccccc00cccccc00cccccccccccdcccccccddcccccc
-- 017:ccc00cccccccccccccccccccccc00cccccc00ccccccccccccccccccdccccccdd
-- </SPRITES>

-- <WAVES>
-- 000:00000000ffffffff00000000ffffffff
-- 001:0123456789abcdeffedcba9876543210
-- 002:0123456789abcdef0123456789abcdef
-- </WAVES>

-- <SFX>
-- 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000304000000000
-- </SFX>

-- <TRACKS>
-- 000:100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
-- </TRACKS>

-- <PALETTE>
-- 000:1a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57
-- </PALETTE>

