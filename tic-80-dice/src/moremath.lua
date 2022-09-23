moremath = {}

function moremath.lerp(startval, endval, t)
  return startval + (endval-startval)*t
end

function moremath.inverseLerp(startval, endval, value)
  return (value-startval)/(endval-startval)
end

function moremath.remap(fromstart, fromend, tostart, toend, value)
  local t = moremath.inverseLerp(fromstart, fromend, value)
  return moremath.lerp(tostart, toend, t)
end