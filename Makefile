export OS=Emscripten
export PKG_CONFIG_PATH

module:
	$(MAKE) -C ZenGarden/src/
	emcc -O3 --memory-init-file 0  -o static/dst/module.js src/helpers.cpp \
		ZenGarden/libs/Emscripten/libzengarden.bc -s RESERVED_FUNCTION_POINTERS=8 \
		-s EXPORTED_FUNCTIONS="['_zg_context_new', '_zg_context_new_graph_from_string', '_zg_graph_attach', \
		'_zg_graph_delete', '_zg_context_process', '_zg_context_delete', '_zg_message_new', \
		'_zg_message_delete', '_zg_message_set_float', '_zg_message_set_symbol', '_zg_message_set_bang', \
		'_zg_context_send_message', '_zg_context_register_memorymapped_abstraction', \
		'_zg_context_unregister_memorymapped_abstraction', '_zg_context_register_receiver', \
		'_zg_context_unregister_receiver', '_name_message_pair_get_name', '_name_message_pair_get_message', \
		'_zg_message_get_num_elements', '_zg_message_get_element_type', '_zg_message_get_float', \
		'_zg_message_get_symbol' ]"

clean:
	$(MAKE) -C ZenGarden/src/ clean
	rm static/dst/module.js