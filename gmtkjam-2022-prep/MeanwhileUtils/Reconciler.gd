class_name Reconciler
extends Resource

var base_reconciler = FlexibleReconciler.new()

var managed_objects := {}

var added_func_ref: FuncRef

# method should take a key as input and return a new Node
func _init(added_func_ref: FuncRef):
	self.added_func_ref = added_func_ref
	
	base_reconciler.connect("key_added", self, "_on_key_added")
	base_reconciler.connect("key_removed", self, "_on_key_removed")
	
func reconcile(new_list: Array) -> void:
	base_reconciler.reconcile(new_list)

func clear() -> void:
	base_reconciler.clear()

func _on_key_added(key):
	var new_object = added_func_ref.call_func(key)
	managed_objects[key] = new_object

func _on_key_removed(key):
	var old_object = managed_objects[key]
	managed_objects.erase(key)
	old_object.queue_free()
