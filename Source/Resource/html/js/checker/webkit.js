var checkerAjax = (function() {
    var formRequest = function(form, formValues, formType) {
        var res = null;

        var options = [];
        if (formType === 'file')
        {
            if ($('#checkerUpload_parseSpeed').is(':checked'))
            {
                options.push("file_parsespeed");
                options.push("1");
            }

            res = webpage.on_file_upload_selected("",
                                                  "",
                                                  "",
                                                  $('#checkerUpload_fixer').is(':checked'),
                                                 options);
        }
        else if (formType === 'url')
        {
            if ($('#checkerOnline_parseSpeed').is(':checked'))
            {
                options.push("file_parsespeed");
                options.push("1");
            }

            res = webpage.on_file_online_selected($('#checkerOnline_file').val(),
                                                  "",
                                                  "",
                                                  "",
                                                  false, options);
        }
        else if (formType === 'repository')
        {
            if ($('#checkerRepository_parseSpeed').is(':checked'))
            {
                options.push("file_parsespeed");
                options.push("1");
            }

            res = webpage.on_file_repository_selected("",
                                                      "",
                                                      "",
                                                      "",
                                                      options);
        }

        formRequestResponse(res, formValues);
    };

    var addExisting = function() {
        var res = undefined;

        res = webpage.on_file_from_db_selected();

        //Nothing to add
        if (res === undefined || !res.length)
            return;

        data = JSON.parse(res);

        var success = 0;
        $.each(data.success, function(index, value)
        {
            if (value.success)
            {
                success++;
                checkerTable.updateFileOrAddFile(value.filename, value.transactionId, value.formValues);
            }
        });

        if (success > 0)
        {
            checkerTable.draw();
            checkerTable.jumpToPageContainingResultId(data.success[0].transactionId);
            checkerTable.startWaitingLoop();
        }
    };

    var formRequestResponse = function(res, formValues)
    {
        if (res === null)
        {
            mcoMessage.error("Form is not reconized.");
            return;
        }

        data = JSON.parse(res);
        var success = 0;
        $.each(data.success, function(index, value)
        {
            if (value.success)
            {
                success++;
                checkerTable.updateFileOrAddFile(value.filename, value.transactionId, formValues);
            }
        });

        if (success > 0)
        {
            checkerTable.draw();
            checkerTable.jumpToPageContainingResultId(data.success[0].transactionId);
            checkerTable.startWaitingLoop();
            if (success == 1)
                mcoMessage.success('File added successfuly');
            else
                mcoMessage.success('Files added successfuly');
        }
        else if (data.error && data.error.length)
            mcoMessage.error(data.error);
        else
            mcoMessage.error("An internal error appears");
    };

    var checkerStatus = function(ids) {
        checkerTable.setCheckerStatusInProgress(true);
        /**
         * Get the status for multiple files
         * @param array ids List of files ID
         *
         * @return json
         * {"status":{"fileId":{"finish":true,"tool":2,"associatedFiles":{"fileId":"fileName"}},"fileId":{"finish":false,"percent":42}}}
         */
        res = webpage.file_is_analyzed(ids);
        data = JSON.parse(res);
        checkerTable.setCheckerStatusInProgress(false);
        checkerTable.processCheckerStatusRequest(data.status);
    };

    var statusReportsMulti = function(reports) {
        /**
         * Get the implementation status and policy status for multiple files
         * @param array reports List of files ID and report type
         *
         * @return json
         * {"fileId":{"implemReport":{"valid":true,"fileId":"1","error":null},"policyReport":{"valid":false,"fileId":"1","error":null}}, ...}
         */

        var list_ids = [];
        var list_policy_ids = [];

        $.each(reports, function(id, report)
        {
            if (report["id"] !== undefined)
            {
                list_ids.push(report["id"]);
                if (report["policyId"] === undefined)
                    list_policy_ids.push(-1);
                else
                    list_policy_ids.push(report["policyId"]);
            }
        });
        res = webpage.status_reports_multi(list_ids, list_policy_ids);
        data = JSON.parse(res);

        $.each(data, function(index, result)
        {
            if (result.error && result.error.length)
                mcoMessage.error(result.error);

            if (result.implemReport !== undefined)
                implementationCell.success(result.implemReport, result.implemReport.fileId);
        })
    };

    var implementationStatus = function(fileId, tool) {
        /**
        * Get the implementation status for a file
        * @param int id The file ID
        * @param int reportType The report type ID
        *
        * @return json
        * {"valid":true,"fileId":"fileId","error":null}
        */
        res = webpage.implementation_is_valid(fileId);
        data = JSON.parse(res);
        implementationCell.success(data, fileId);
    };

    var implementationReport = function(fileId, display, verbosity, tool) {
        res = webpage.on_fill_implementation_report(fileId, display, verbosity);
        data = JSON.parse(res);
        implementationCell.displayReport(fileId, data);
    };

    var forceAnalyze = function(fileId) {
        res = webpage.checker_force_analyze(fileId);
        data = JSON.parse(res);
        if (data.error && data.error.length)
            mcoMessage.error(data.error);
        else
        {
            checkerTable.startWaitingLoop();
            mcoMessage.success('File reloaded successfuly');
        }
    };

    var downloadImplementationReportUrl = function(fileId, tool, display, verbosity) {
        webpage.on_save_implementation_report(fileId, display, verbosity);
    };

    var closeAll = function() {
        webpage.close_all();
    };

    var closeElement = function(id) {
        webpage.close_element(id);
    };

    return {
        formRequest: formRequest,
        formRequestResponse: formRequestResponse,
        checkerStatus: checkerStatus,
        statusReportsMulti: statusReportsMulti,
        implementationStatus: implementationStatus,
        implementationReport: implementationReport,
        forceAnalyze: forceAnalyze,
        downloadImplementationReportUrl: downloadImplementationReportUrl,
        addExisting: addExisting,
        closeAll: closeAll,
        closeElement: closeElement,
    };
})();
