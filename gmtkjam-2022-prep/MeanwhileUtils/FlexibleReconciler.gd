class_name FlexibleReconciler
extends Reference

var known_keys := {}

signal key_added(key)
signal key_removed(key)

func reconcile(new_list: Array):
	var keys_to_create := []
	for new_key in new_list:
		if not known_keys[new_key]:
			keys_to_create.append(new_key)
	
	var keys_to_remove := []
	for old_key in known_keys.keys():
		if not old_key in new_list:
			keys_to_remove.append(old_key)
			
	for new_key in keys_to_create:
		emit_signal("key_added", new_key)
		known_keys[new_key] = true
	for old_key in keys_to_remove:
		emit_signal("key_removed", old_key)
		known_keys.erase(old_key)

func clear():
	self.reconcile([])
