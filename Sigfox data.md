# Sigfox data
#bcwork



![](Sigfox%20data/0DCA4418-B49E-4A86-AF8D-C14E752C903F.png)
* Data payload :
12 byte in hex
```
[0][1] : Temperature 
[2][3] : Humidity
[4][5][6][7] : pm2.5
[8][9][10][11] : voltage 
```
#### example:
timestamp : 2019-06-24T20:02:35+00:00
**Data payload = 173900000feb**
=> temperature :  23 degree C
=> humidity : 58 %
=> pm2.5 : 0 ug/m3
=> voltage : 4068 mV
