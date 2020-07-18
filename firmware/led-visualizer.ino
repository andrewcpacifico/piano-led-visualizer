#include <Adafruit_NeoPixel.h>
#define PIN 7
#define NUMPIXELS 175

#define BAUD_RATE 2000000
#define COMMAND_SIZE 4

#define RES_OK 0x0
#define RES_CONNECTED 0x1

Adafruit_NeoPixel strip(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);
byte buffer[COMMAND_SIZE];
byte offset;

void setup()
{
  strip.begin();
  strip.clear();

  Serial.begin(BAUD_RATE);
  offset = 0;
  Serial.write(RES_CONNECTED);
}

void loop()
{
  while (Serial.available() > 0) {
    buffer[offset] = Serial.read();
    offset++;

    if (offset == COMMAND_SIZE) {
      runCommand();
      Serial.write(RES_OK);
      offset = 0;
    }
  }
}

void runCommand()
{
  strip.setPixelColor(buffer[0], strip.Color(buffer[1], buffer[2], buffer[3]));
  strip.show();
}