#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define TRIG_PIN 13
#define ECHO_PIN 12

LiquidCrystal_I2C lcd(0x27, 16, 2);

// ===== SENSOR & DATA =====
long duration;
float jarak;
float tinggiMaks;
float tinggiAir;
String statusAir;

// ===== LCD MODE =====
unsigned long lastSwitch = 0;
const unsigned long intervalTampil = 5000;
bool modeUtama = true;

// ===== WIFI =====
const char* ssid = "LPG";
const char* password = "12345678";
const char* serverName = "http://10.116.65.46/flood_iot/insert.php";

const unsigned long timeoutUS = 30000;

unsigned long lastSend = 0;
const unsigned long intervalSend = 10000; // 10 detik


// ================== FUNGSI ==================
float bacaJarak() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  duration = pulseIn(ECHO_PIN, HIGH, timeoutUS);
  if (duration == 0) return -1;

  return duration * 0.034 / 2;
}

String tentukanStatus(float tinggi) {
  if (tinggi < 5) return "AMAN";
  else if (tinggi < 10) return "WASPADA";
  else return "BAHAYA";
}

void kirimKeServer(float jarak, float air, String status) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String postData =
      "jarak=" + String(jarak, 1) +
      "&air=" + String(air, 1) +
      "&status=" + status;

    int httpResponseCode = http.POST(postData);
    Serial.print("HTTP Response: ");
    Serial.println(httpResponseCode);

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}

// ================== SETUP ==================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // ===== I2C & LCD (WAJIB DI AWAL) =====
  Wire.begin(21, 22);
  delay(500);

  lcd.init();
  lcd.backlight();
  delay(500);

  lcd.setCursor(0, 0);
  lcd.print("Flood Monitor");
  lcd.setCursor(0, 1);
  lcd.print("Init...");
  delay(1500);
  lcd.clear();

  // ===== WIFI =====
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  delay(2000);
  lcd.clear();

  // ===== KALIBRASI =====
  lcd.print("Kalibrasi...");
  float total = 0;
  int valid = 0;

  for (int i = 0; i < 5; i++) {
    float d = bacaJarak();
    if (d > 0) {
      total += d;
      valid++;
    }
    delay(300);
  }

  if (valid > 0) tinggiMaks = total / valid;
  else tinggiMaks = 0;

  Serial.println("=== KALIBRASI ===");
  Serial.print("Tinggi Maks: ");
  Serial.print(tinggiMaks);
  Serial.println(" cm");

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Kalibrasi OK");
  lcd.setCursor(0, 1);
  lcd.print("Tinggi:");
  lcd.print(tinggiMaks, 1);
  lcd.print("cm");
  delay(2000);
  lcd.clear();
}

// ================== LOOP ==================
void loop() {
  jarak = bacaJarak();
  Serial.print("Jarak Asli: ");
  Serial.println(jarak);

  if (jarak > 0) {
    tinggiAir = tinggiMaks - jarak;
    if (tinggiAir < 0) tinggiAir = 0;

    statusAir = tentukanStatus(tinggiAir);

    if (millis() - lastSend >= intervalSend) {
      kirimKeServer(jarak, tinggiAir, statusAir);
      lastSend = millis();
    }
    if (millis() - lastSwitch >= intervalTampil) {
      modeUtama = !modeUtama;
      lastSwitch = millis();
      lcd.clear();
    }

    if (modeUtama) {
      lcd.setCursor(0, 0);
      lcd.print("Air:");
      lcd.print(tinggiAir, 1);
      lcd.print("cm");

      lcd.setCursor(0, 1);
      lcd.print("Status:");
      lcd.print(statusAir);
    } else {
      lcd.setCursor(0, 0);
      lcd.print("Jarak:");
      lcd.print(jarak, 1);
      lcd.print("cm");

      lcd.setCursor(0, 1);
      lcd.print("Max:");
      lcd.print(tinggiMaks, 1);
      lcd.print("cm");
    }
  } else {
    lcd.clear();
    lcd.print("No Echo");
  }

  delay(5000);
}
