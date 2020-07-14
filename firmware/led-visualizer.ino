#include <Adafruit_NeoPixel.h>
#define PIN 7
#define NUMPIXELS 175

#define NO_COMMAND 0x0
#define NO_KEY 0xFF
#define NO_ACTION 0xFF

#define CMD_KEY_ON 0x1
#define CMD_KEY_OFF 0x2
#define CMD_CHANGE_COLOR 0x3

#define WAITING_COMMAND 0x1
#define WAITING_KEY 0x2
#define WAITING_COLOR 0x3

#define BAUD_RATE 1000000

Adafruit_NeoPixel strip(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);
uint32_t color;

byte readingStatus = WAITING_COMMAND;
byte pendingAction = NO_ACTION;

int getPixelId(int key)
{
  int pixel = key * 2;

  if (key > 34) {
    pixel--;
  }

  return pixel;
}

void turnOnKey(int key)
{
  int pixel = getPixelId(key);

  strip.fill(color, pixel, 2);
  strip.show();
}

void turnOffKey(int key)
{
  int pixel = getPixelId(key);
  strip.fill(strip.Color(0, 0, 0), pixel, 2);
  strip.show();
}

void changeColor(byte r, byte g, byte b)
{
  color = strip.Color(r, g, b);
}

void setup()
{
  int r = random(0, 255);
  int g = random(0, 255);
  int b = random(0, 255);

  color = strip.Color(0, 0, 255);

  strip.begin();
  strip.clear();

  Serial.begin(BAUD_RATE);
  Serial.println("<Arduino is ready>");
}

void loop()
{
  if (readingStatus == WAITING_COMMAND) {
    byte cmd = readCommand();

    if (cmd != NO_COMMAND) {
      Serial.print("Command received: ");
      Serial.print(cmd, DEC);
      Serial.println();

      if (cmd == CMD_KEY_ON || cmd == CMD_KEY_OFF) {
        Serial.println("Changing status to WAITING_KEY");

        readingStatus = WAITING_KEY;
        pendingAction = cmd;
      } else if (cmd == CMD_CHANGE_COLOR) {
        Serial.println("Changing status to WAITING_COLOR");

        readingStatus = WAITING_COLOR;
      }
    }
  }

  if (readingStatus == WAITING_KEY) {
    byte key = readKey();

    if (key != NO_KEY) {
      Serial.print("Key received: ");
      Serial.print(key, DEC);
      Serial.println();

      Serial.println("Changing status to WAITING_COMMAND");

      if (pendingAction == CMD_KEY_ON) {
        turnOnKey(key);
      } else if (pendingAction == CMD_KEY_OFF) {
        turnOffKey(key);
      }

      pendingAction = NO_ACTION;
      readingStatus = WAITING_COMMAND;
    }
  }

  if (readingStatus == WAITING_COLOR) {
    byte color[3];

    Serial.readBytes(color, 3);

    changeColor(color[0], color[1], color[2]);
    Serial.println("Led strip color updated");
    readingStatus = WAITING_COMMAND;
  }
}

byte readCommand()
{
  if (Serial.available() > 0 && readingStatus == WAITING_COMMAND) {
    return Serial.read();
  }

  return NO_COMMAND;
}

byte readKey()
{
  if (Serial.available() > 0 && readingStatus == WAITING_KEY) {
    return Serial.read();
  }

  return NO_KEY;
}