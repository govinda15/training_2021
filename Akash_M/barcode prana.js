var recordFromFailedMessageQueue = new GlideRecord("x_224218_brcd_hdsk_failed_message_queue");
recordFromFailedMessageQueue.orderBy('sys_created_on');
recordFromFailedMessageQueue.query();

while (recordFromFailedMessageQueue.next()) {
    recordFromFailedMessageQueue.notification_sent = false;
    recordFromFailedMessageQueue.update();
    var response = "";
    var responseBody = "";
    var httpStatus = "";
    var message = "";
    var apiCallCount = 0;
    if (recordFromFailedMessageQueue.notification_sent == false) {
        do {
            try {
                var r = new sn_ws.RESTMessageV2('x_224218_brcd_hdsk.Barcode Help Desk', 'isUp');
                response = r.execute();
                responseBody = response.getBody();
                httpStatus = response.getStatusCode();
            } catch (ex) {
                message = ex.message;
            }
            if (httpStatus >= 200 || httpStatus < 300) {
                try {
                    var rs = new sn_ws.RESTMessageV2('x_224218_brcd_hdsk.Barcode Help Desk', 'sendBarcodeTicket');
                    rs.setRequestBody(recordFromFailedMessageQueue.request_body);
                    response = rs.execute();
                    responseBody = response.getBody();
                    httpStatus = response.getStatusCode();
                    //here do something to stop.
                } catch (ex) {
                    message = ex.message;
                }
            } else {
                apiCallCount = apiCallCount + 1;
            }
        } while (apiCallCount < 10);
    }
    if(apiCallCount>10){
        gs.eventQueue("x_224218_brcd_hdsk.integration.failure", current, gs.getUserID(), gs.getUserName());
        recordFromFailedMessageQueue.notification_sent = true;
        recordFromFailedMessageQueue.update();

    }
    
}