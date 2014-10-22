#include <pebble.h>
#include "transmission.h"

void load_torrent_list() {
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  
  Tuplet tuple = TupletCString(TKEY_ACTION, "list");
  dict_write_tuplet(iter, &tuple);
  
  dict_write_end(iter);
  app_message_outbox_send();
}

void draw_list(Tuple *data) {

}
