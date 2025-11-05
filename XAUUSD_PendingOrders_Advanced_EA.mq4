//+------------------------------------------------------------------+
//|                             XAUUSD_PendingOrders_Advanced_EA.mq4 |
//|                      Расширенная версия EA с индикаторами        |
//|                           Торговля отложенными ордерами с TP/SL  |
//+------------------------------------------------------------------+
#property copyright "MT4 EA Advanced"
#property link      ""
#property version   "1.10"
#property strict

// Входные параметры
input string Section1 = "===== Основные параметры =====";
input double LotSize = 0.01;                  // Размер лота
input int TakeProfit = 100;                   // Take Profit в пунктах
input int StopLoss = 50;                      // Stop Loss в пунктах
input int PendingDistance = 30;               // Дистанция для отложенного ордера (в пунктах)
input int ReorderTime = 300;                  // Время до перевыставления ордера (в секундах)
input int MagicNumber = 123456;               // Магический номер
input string TradeSymbol = "XAUUSD";          // Торговый символ

input string Section2 = "===== Настройки торговли =====";
input bool UseBuyOrders = true;               // Использовать ордера на покупку
input bool UseSellOrders = true;              // Использовать ордера на продажу
input int MaxSpread = 50;                     // Максимальный спред в пунктах
input double RiskPercent = 0;                 // Процент риска от депозита (0 = фиксированный лот)
input int Slippage = 3;                       // Проскальзывание

input string Section3 = "===== Фильтры на основе индикаторов =====";
input bool UseMAFilter = false;               // Использовать фильтр по Moving Average
input int MA_Period = 50;                     // Период Moving Average
input ENUM_MA_METHOD MA_Method = MODE_EMA;    // Метод MA
input bool UseRSIFilter = false;              // Использовать фильтр по RSI
input int RSI_Period = 14;                    // Период RSI
input int RSI_BuyLevel = 30;                  // RSI уровень для покупки (перепроданность)
input int RSI_SellLevel = 70;                 // RSI уровень для продажи (перекупленность)

input string Section4 = "===== Управление временем =====";
input bool UseTimeFilter = false;             // Использовать временной фильтр
input int StartHour = 8;                      // Час начала торговли
input int EndHour = 20;                       // Час окончания торговли

input string Section5 = "===== Дополнительно =====";
input bool UseTrailingStop = false;           // Использовать трейлинг-стоп
input int TrailingStop = 30;                  // Размер трейлинг-стопа в пунктах
input int TrailingStep = 10;                  // Шаг трейлинг-стопа в пунктах
input int MaxOrders = 1;                      // Максимум одновременных ордеров на направление

// Глобальные переменные
datetime LastBuyOrderTime = 0;
datetime LastSellOrderTime = 0;
int BuyOrderTicket = 0;
int SellOrderTicket = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   if(Period() != PERIOD_M5)
   {
      Alert("Советник предназначен для работы на таймфрейме M5!");
      return(INIT_FAILED);
   }
   
   if(Symbol() != TradeSymbol)
   {
      Alert("Советник предназначен для торговли на паре ", TradeSymbol);
      return(INIT_FAILED);
   }
   
   Print("Advanced EA инициализирован успешно для ", TradeSymbol, " на M5");
   Print("Использование фильтров: MA=", UseMAFilter, " RSI=", UseRSIFilter, " Time=", UseTimeFilter);
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("Advanced EA остановлен. Причина: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   double spread = (Ask - Bid) / Point;
   if(spread > MaxSpread)
   {
      return;
   }
   
   if(UseTimeFilter && !IsTimeToTrade())
   {
      return;
   }
   
   if(UseTrailingStop)
   {
      ManageTrailingStop();
   }
   
   if(UseBuyOrders)
   {
      ManageBuyPendingOrder();
   }
   
   if(UseSellOrders)
   {
      ManageSellPendingOrder();
   }
}

//+------------------------------------------------------------------+
//| Проверка времени торговли                                        |
//+------------------------------------------------------------------+
bool IsTimeToTrade()
{
   int currentHour = Hour();
   
   if(StartHour < EndHour)
   {
      return (currentHour >= StartHour && currentHour < EndHour);
   }
   else
   {
      return (currentHour >= StartHour || currentHour < EndHour);
   }
}

//+------------------------------------------------------------------+
//| Проверка фильтра по Moving Average                               |
//+------------------------------------------------------------------+
bool CheckMAFilter(bool isBuy)
{
   if(!UseMAFilter) return true;
   
   double ma = iMA(TradeSymbol, PERIOD_M5, MA_Period, 0, MA_Method, PRICE_CLOSE, 0);
   double close = iClose(TradeSymbol, PERIOD_M5, 0);
   
   if(isBuy)
      return (close > ma);
   else
      return (close < ma);
}

//+------------------------------------------------------------------+
//| Проверка фильтра по RSI                                          |
//+------------------------------------------------------------------+
bool CheckRSIFilter(bool isBuy)
{
   if(!UseRSIFilter) return true;
   
   double rsi = iRSI(TradeSymbol, PERIOD_M5, RSI_Period, PRICE_CLOSE, 0);
   
   if(isBuy)
      return (rsi < RSI_BuyLevel);
   else
      return (rsi > RSI_SellLevel);
}

//+------------------------------------------------------------------+
//| Управление трейлинг-стопом                                       |
//+------------------------------------------------------------------+
void ManageTrailingStop()
{
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == TradeSymbol && OrderMagicNumber() == MagicNumber)
         {
            if(OrderType() == OP_BUY)
            {
               double newSL = NormalizeDouble(Bid - TrailingStop * Point, Digits);
               if(newSL > OrderStopLoss() && Bid - OrderOpenPrice() > TrailingStop * Point)
               {
                  if(newSL - OrderStopLoss() >= TrailingStep * Point)
                  {
                     OrderModify(OrderTicket(), OrderOpenPrice(), newSL, OrderTakeProfit(), 0, clrBlue);
                  }
               }
            }
            else if(OrderType() == OP_SELL)
            {
               double newSL = NormalizeDouble(Ask + TrailingStop * Point, Digits);
               if(newSL < OrderStopLoss() || OrderStopLoss() == 0)
               {
                  if(OrderOpenPrice() - Ask > TrailingStop * Point)
                  {
                     if(OrderStopLoss() - newSL >= TrailingStep * Point || OrderStopLoss() == 0)
                     {
                        OrderModify(OrderTicket(), OrderOpenPrice(), newSL, OrderTakeProfit(), 0, clrBlue);
                     }
                  }
               }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Управление отложенным ордером на покупку                         |
//+------------------------------------------------------------------+
void ManageBuyPendingOrder()
{
   bool orderExists = false;
   
   if(BuyOrderTicket > 0)
   {
      if(OrderSelect(BuyOrderTicket, SELECT_BY_TICKET))
      {
         if(OrderType() == OP_BUYSTOP && OrderCloseTime() == 0)
         {
            orderExists = true;
            
            if(TimeCurrent() - LastBuyOrderTime > ReorderTime)
            {
               if(OrderDelete(BuyOrderTicket))
               {
                  Print("Удален старый BuyStop ордер #", BuyOrderTicket);
                  BuyOrderTicket = 0;
                  orderExists = false;
               }
            }
         }
         else
         {
            BuyOrderTicket = 0;
            orderExists = false;
         }
      }
      else
      {
         BuyOrderTicket = 0;
         orderExists = false;
      }
   }
   
   if(!orderExists && CountOrders(OP_BUY) < MaxOrders && CountOrders(OP_BUYSTOP) < MaxOrders)
   {
      if(CheckMAFilter(true) && CheckRSIFilter(true))
      {
         PlaceBuyStopOrder();
      }
   }
}

//+------------------------------------------------------------------+
//| Управление отложенным ордером на продажу                         |
//+------------------------------------------------------------------+
void ManageSellPendingOrder()
{
   bool orderExists = false;
   
   if(SellOrderTicket > 0)
   {
      if(OrderSelect(SellOrderTicket, SELECT_BY_TICKET))
      {
         if(OrderType() == OP_SELLSTOP && OrderCloseTime() == 0)
         {
            orderExists = true;
            
            if(TimeCurrent() - LastSellOrderTime > ReorderTime)
            {
               if(OrderDelete(SellOrderTicket))
               {
                  Print("Удален старый SellStop ордер #", SellOrderTicket);
                  SellOrderTicket = 0;
                  orderExists = false;
               }
            }
         }
         else
         {
            SellOrderTicket = 0;
            orderExists = false;
         }
      }
      else
      {
         SellOrderTicket = 0;
         orderExists = false;
      }
   }
   
   if(!orderExists && CountOrders(OP_SELL) < MaxOrders && CountOrders(OP_SELLSTOP) < MaxOrders)
   {
      if(CheckMAFilter(false) && CheckRSIFilter(false))
      {
         PlaceSellStopOrder();
      }
   }
}

//+------------------------------------------------------------------+
//| Подсчет ордеров                                                  |
//+------------------------------------------------------------------+
int CountOrders(int orderType)
{
   int count = 0;
   for(int i = OrdersTotal() - 1; i >= 0; i--)
   {
      if(OrderSelect(i, SELECT_BY_POS, MODE_TRADES))
      {
         if(OrderSymbol() == TradeSymbol && OrderMagicNumber() == MagicNumber)
         {
            if(OrderType() == orderType)
            {
               count++;
            }
         }
      }
   }
   return count;
}

//+------------------------------------------------------------------+
//| Размещение отложенного ордера BuyStop                            |
//+------------------------------------------------------------------+
void PlaceBuyStopOrder()
{
   double lotSize = CalculateLotSize(StopLoss);
   
   double high = iHigh(TradeSymbol, PERIOD_M5, 1);
   double entryPrice = NormalizeDouble(high + PendingDistance * Point, Digits);
   
   if(entryPrice <= Ask)
   {
      entryPrice = NormalizeDouble(Ask + PendingDistance * Point, Digits);
   }
   
   double sl = NormalizeDouble(entryPrice - StopLoss * Point, Digits);
   double tp = NormalizeDouble(entryPrice + TakeProfit * Point, Digits);
   
   double minDistance = MarketInfo(TradeSymbol, MODE_STOPLEVEL) * Point;
   if(entryPrice - Ask < minDistance)
   {
      entryPrice = NormalizeDouble(Ask + minDistance + 5 * Point, Digits);
      sl = NormalizeDouble(entryPrice - StopLoss * Point, Digits);
      tp = NormalizeDouble(entryPrice + TakeProfit * Point, Digits);
   }
   
   int ticket = OrderSend(
      TradeSymbol,
      OP_BUYSTOP,
      lotSize,
      entryPrice,
      Slippage,
      sl,
      tp,
      "BuyStop Advanced",
      MagicNumber,
      0,
      clrGreen
   );
   
   if(ticket > 0)
   {
      BuyOrderTicket = ticket;
      LastBuyOrderTime = TimeCurrent();
      Print("BuyStop ордер размещен #", ticket, " Цена:", entryPrice, " SL:", sl, " TP:", tp, " Лот:", lotSize);
   }
   else
   {
      Print("Ошибка размещения BuyStop: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| Размещение отложенного ордера SellStop                           |
//+------------------------------------------------------------------+
void PlaceSellStopOrder()
{
   double lotSize = CalculateLotSize(StopLoss);
   
   double low = iLow(TradeSymbol, PERIOD_M5, 1);
   double entryPrice = NormalizeDouble(low - PendingDistance * Point, Digits);
   
   if(entryPrice >= Bid)
   {
      entryPrice = NormalizeDouble(Bid - PendingDistance * Point, Digits);
   }
   
   double sl = NormalizeDouble(entryPrice + StopLoss * Point, Digits);
   double tp = NormalizeDouble(entryPrice - TakeProfit * Point, Digits);
   
   double minDistance = MarketInfo(TradeSymbol, MODE_STOPLEVEL) * Point;
   if(Bid - entryPrice < minDistance)
   {
      entryPrice = NormalizeDouble(Bid - minDistance - 5 * Point, Digits);
      sl = NormalizeDouble(entryPrice + StopLoss * Point, Digits);
      tp = NormalizeDouble(entryPrice - TakeProfit * Point, Digits);
   }
   
   int ticket = OrderSend(
      TradeSymbol,
      OP_SELLSTOP,
      lotSize,
      entryPrice,
      Slippage,
      sl,
      tp,
      "SellStop Advanced",
      MagicNumber,
      0,
      clrRed
   );
   
   if(ticket > 0)
   {
      SellOrderTicket = ticket;
      LastSellOrderTime = TimeCurrent();
      Print("SellStop ордер размещен #", ticket, " Цена:", entryPrice, " SL:", sl, " TP:", tp, " Лот:", lotSize);
   }
   else
   {
      Print("Ошибка размещения SellStop: ", GetLastError());
   }
}

//+------------------------------------------------------------------+
//| Расчет размера лота                                              |
//+------------------------------------------------------------------+
double CalculateLotSize(int stopLossPips)
{
   double lot = LotSize;
   
   if(RiskPercent > 0)
   {
      double balance = AccountBalance();
      double riskAmount = balance * RiskPercent / 100.0;
      double tickValue = MarketInfo(TradeSymbol, MODE_TICKVALUE);
      double tickSize = MarketInfo(TradeSymbol, MODE_TICKSIZE);
      
      if(tickValue > 0 && stopLossPips > 0)
      {
         double stopLossValue = stopLossPips * Point;
         lot = NormalizeDouble(riskAmount / (stopLossValue / tickSize * tickValue), 2);
      }
   }
   
   double minLot = MarketInfo(TradeSymbol, MODE_MINLOT);
   double maxLot = MarketInfo(TradeSymbol, MODE_MAXLOT);
   double lotStep = MarketInfo(TradeSymbol, MODE_LOTSTEP);
   
   if(lot < minLot) lot = minLot;
   if(lot > maxLot) lot = maxLot;
   
   lot = NormalizeDouble(lot / lotStep, 0) * lotStep;
   
   return lot;
}
//+------------------------------------------------------------------+
