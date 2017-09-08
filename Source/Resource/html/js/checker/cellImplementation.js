var implementationCell = (function() {
    var result;
    var init = function(table) {
        result = table;
    };

    var success = function(data, fileId) {
        var nodeCell = result.$('#result-' + fileId);
        var nodeImplem = $(result.cell(nodeCell, 1).node());

        if (data.valid) {
            nodeImplem.addClass('success');
            var implemResultText = '<span class="implemResult"><span class="glyphicon glyphicon-ok text-success" aria-hidden="true"></span> Valid</span>'
        }
        else {
            nodeImplem.addClass('danger');
            var implemResultText = '<span class="implemResult"><span class="glyphicon glyphicon-remove text-danger" aria-hidden="true"></span> Not valid</span>';
        }

        result.cell(nodeCell, 1).data('<div>' + implemResultText + '<p class="implemButton hidden"><a href="#" data-toggle="modal" data-target="#modalConformance-' + fileId + '" title="View implementation report"><span class="glyphicon glyphicon-eye-open implem-view" aria-hidden="true"></span></a><a href="#" class="implem-dld" title="Download implementation report"><span class="glyphicon glyphicon-download" aria-hidden="true"></span></a></p></div>');

        nodeImplem.find('.implem-view').on('click', function(e) {
            e.preventDefault();
            var nodeModal = result.$('#result-' + fileId);
            if (!$('#modalConformance-' + fileId).length) {
                $('.result-container').append(' \
                <div id="modalConformance-' + fileId + '" \ class="modal fade"> \
                    <div class="modal-dialog modal-lg"> \
                        <div class="modal-content"> \
                            <div class="modal-header"> \
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> \
                                <h4 class="modal-title">Implementation report</h4> \
                            </div> \
                            <div class="modal-body"></div> \
                            <div class="modal-footer"> \
                                <button type="button" class="btn btn-primary implem-dld" data-target="#modalConformance-' + fileId + '">Download implementation report</button> \
                                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> \
                            </div> \
                        </div> \
                    </div> \
                </div>');

                addSpinnerToModal(fileId);
                checkerAjax.implementationReport(fileId, "", "", nodeModal.data('tool'));

                $('#modalConformance-' + fileId + ' .implem-dld').on('click', function(e) {
                    e.preventDefault();
                    var modalDisplay = "";
                    var modalVerbosity = "";
                    checkerAjax.downloadImplementationReportUrl(fileId, nodeModal.data('tool'), modalDisplay, modalVerbosity);
                });

                if (2 != nodeModal.data('tool')) {
                    $('#modalConformance-' + fileId + ' .modal-implem-verbosity').hide();
                }
            }
        });

        nodeImplem.find('.implem-dld').on('click', function(e) {
            e.preventDefault();
            var nodeDld = result.$('#result-' + fileId);
            checkerAjax.downloadImplementationReportUrl(fileId, nodeDld.data('tool'), "", "");
        });
    };

    var error = function(fileId) {
        var nodeCell = result.$('#result-' + fileId);
        var nodeImplem = $(result.cell(nodeCell, 1).node());
        nodeImplem.addClass('danger');
        result.cell(nodeCell, 1).data('<span class="glyphicon glyphicon-remove text-danger" aria-hidden="true"></span> Server Error')
    };

    var addSpinnerToCell = function(fileId) {
        result.cell('#result-' + fileId, 1).data('<span class="spinner-cell"></span>');
    };

    var addSpinnerToModal = function(fileId) {
        $('#modalConformance-' + fileId + ' .modal-body').html('<span class="spinner-modal"></span>');
    };

    // Display report in the modal
    var displayReport = function(fileId, dataReport) {
        if (dataReport.isHtmlReport) {
            $('#modalConformance-' + fileId + ' .modal-body').html(dataReport.report);
        }
        else {
            $('#modalConformance-' + fileId + ' .modal-body').html('<pre class="report-content">');
            $('#modalConformance-' + fileId + ' .report-content').text(dataReport.report);
        }

        $('#modalConformance-' + fileId + ' .implem-dld').prop('disabled', false);
    };

    // Display report error in the modal
    var displayReportError = function(fileId) {
        $('#modalConformance-' + fileId + ' .modal-body').html('Error: the requested report can not be retrieved');

        $('#modalConformance-' + fileId + ' .implem-dld').prop('disabled', true);
    };

    var reset = function(fileId) {
        $(result.cell('#result-' + fileId, 1).node()).removeClass();
        $(result.cell('#result-' + fileId, 1).node()).empty();
    };

    var removeModalIfExists = function(fileId) {
        if ($('#modalConformance-' + fileId).length) {
            $('#modalConformance-' + fileId).remove();
        }
    };

    return {
        init: init,
        success: success,
        error: error,
        addSpinnerToCell: addSpinnerToCell,
        displayReport: displayReport,
        displayReportError: displayReportError,
        reset: reset,
        removeModalIfExists: removeModalIfExists,
    };
})();
