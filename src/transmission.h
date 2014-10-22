#ifndef TRANSMISSION_H_
#define TRANSMISSION_H_

#include <pebble.h>

enum {
  TKEY_ACTION = 0,
  TKEY_RESOURCE = 1,
  TKEY_DATA = 2
};

enum {
  ACTION_LIST = 0
};

void load_torrent_list();
void draw_list(Tuple *data);

#endif
