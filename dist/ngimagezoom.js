(function(window, document, angular) {
'use strict';
angular.module('imageZoom', []);

angular.module('imageZoom').run(['$templateCache', function($templateCache) {
    $templateCache.put('zoom.html','<div class=\"original\">\r\n    <img ng-src=\"{{src}}\"/>\r\n</div>\r\n<div class=\"zoomed\">\r\n    <img/>\r\n</div>\r\n');
}]);

angular
    .module('imageZoom')
    .directive('zoom', function () {
        function link(scope, element, attrs) {

            var $ = angular.element,
                original = $(element[0].querySelector('.original')),
                originalImg = original.find('img'),
                zoomed = $(element[0].querySelector('.zoomed')),
                zoomedImg = zoomed.find('img');

            var mark = $('<div></div>')
                .addClass('mark')
                .css('position', 'absolute')
                .css('height', scope.markHeight + 'px')
                .css('width', scope.markWidth + 'px');

            element.append(mark);

            element
                .on('mouseenter', function (evt) {
                    mark.removeClass('hide');

                    var offset = calculateOffset(evt);
                    moveMark(offset.X, offset.Y);
                })
                .on('mouseleave', function (evt) {
                    mark.addClass('hide');
                })
                .on('mousemove', function (evt) {
                    var offset = calculateOffset(evt);
                    moveMark(offset.X, offset.Y);
                });

            scope.$on('mark:moved', function (event, data) {
                updateZoomed.apply(this, data);
            });

            function moveMark(offsetX, offsetY) {
                var dx = scope.markWidth,
                    dy = scope.markHeight,
                    x = offsetX - dx / 2,
                    y = offsetY - dy / 2;

                mark
                    .css('left', x + 'px')
                    .css('top', y + 'px');

                scope.$broadcast('mark:moved', [
                    x, y, dx, dy, originalImg[0].height, originalImg[0].width
                ]);
            }

            function updateZoomed(originalX, originalY, originalDx, originalDy, originalHeight, originalWidth) {
                var zoomLvl = scope.zoomLvl;
                scope.$apply(function () {
                    zoomed
                        .css('height', zoomLvl * originalDy + 'px')
                        .css('width', zoomLvl * originalDx + 'px');
                    zoomedImg
                        .attr('src', scope.src)
                        .css('height', zoomLvl * originalHeight + 'px')
                        .css('width', zoomLvl * originalWidth + 'px')
                        .css('left', -zoomLvl * originalX + 'px')
                        .css('top', -zoomLvl * originalY + 'px');
                });
            }

            var rect;

            function calculateOffset(mouseEvent) {
                rect = rect || mouseEvent.target.getBoundingClientRect();
                var offsetX = mouseEvent.clientX - rect.left;
                var offsetY = mouseEvent.clientY - rect.top;

                return {
                    X: offsetX,
                    Y: offsetY
                }
            }

            attrs.$observe('ngSrc', function (data) {
                scope.src = attrs.ngSrc;
            }, true);

            attrs.$observe('zoomLvl', function (data) {
                scope.zoomLvl = data;
            }, true);
        }

        return {
            restrict: 'EA',
            scope: {
                markHeight: '@markHeight',
                markWidth: '@markWidth',
                src: '@src',
                zoomLvl: '@zoomLvl'
            },
            templateUrl: 'zoom.html',
            link: link
        };
    });

}(window, document, window.angular));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInRlbXBsYXRlcy5qcyIsImRpcmVjdGl2ZXMvem9vbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJuZ2ltYWdlem9vbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdpbWFnZVpvb20nLCBbXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnaW1hZ2Vab29tJykucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnem9vbS5odG1sJywnPGRpdiBjbGFzcz1cXFwib3JpZ2luYWxcXFwiPlxcclxcbiAgICA8aW1nIG5nLXNyYz1cXFwie3tzcmN9fVxcXCIvPlxcclxcbjwvZGl2PlxcclxcbjxkaXYgY2xhc3M9XFxcInpvb21lZFxcXCI+XFxyXFxuICAgIDxpbWcvPlxcclxcbjwvZGl2PlxcclxcbicpO1xufV0pO1xuIiwiYW5ndWxhclxuICAgIC5tb2R1bGUoJ2ltYWdlWm9vbScpXG4gICAgLmRpcmVjdGl2ZSgnem9vbScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcblxuICAgICAgICAgICAgdmFyICQgPSBhbmd1bGFyLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgb3JpZ2luYWwgPSAkKGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLm9yaWdpbmFsJykpLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsSW1nID0gb3JpZ2luYWwuZmluZCgnaW1nJyksXG4gICAgICAgICAgICAgICAgem9vbWVkID0gJChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy56b29tZWQnKSksXG4gICAgICAgICAgICAgICAgem9vbWVkSW1nID0gem9vbWVkLmZpbmQoJ2ltZycpO1xuXG4gICAgICAgICAgICB2YXIgbWFyayA9ICQoJzxkaXY+PC9kaXY+JylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ21hcmsnKVxuICAgICAgICAgICAgICAgIC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJylcbiAgICAgICAgICAgICAgICAuY3NzKCdoZWlnaHQnLCBzY29wZS5tYXJrSGVpZ2h0ICsgJ3B4JylcbiAgICAgICAgICAgICAgICAuY3NzKCd3aWR0aCcsIHNjb3BlLm1hcmtXaWR0aCArICdweCcpO1xuXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZChtYXJrKTtcblxuICAgICAgICAgICAgZWxlbWVudFxuICAgICAgICAgICAgICAgIC5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFyay5yZW1vdmVDbGFzcygnaGlkZScpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBjYWxjdWxhdGVPZmZzZXQoZXZ0KTtcbiAgICAgICAgICAgICAgICAgICAgbW92ZU1hcmsob2Zmc2V0LlgsIG9mZnNldC5ZKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFyay5hZGRDbGFzcygnaGlkZScpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBjYWxjdWxhdGVPZmZzZXQoZXZ0KTtcbiAgICAgICAgICAgICAgICAgICAgbW92ZU1hcmsob2Zmc2V0LlgsIG9mZnNldC5ZKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2NvcGUuJG9uKCdtYXJrOm1vdmVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlWm9vbWVkLmFwcGx5KHRoaXMsIGRhdGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG1vdmVNYXJrKG9mZnNldFgsIG9mZnNldFkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZHggPSBzY29wZS5tYXJrV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGR5ID0gc2NvcGUubWFya0hlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgeCA9IG9mZnNldFggLSBkeCAvIDIsXG4gICAgICAgICAgICAgICAgICAgIHkgPSBvZmZzZXRZIC0gZHkgLyAyO1xuXG4gICAgICAgICAgICAgICAgbWFya1xuICAgICAgICAgICAgICAgICAgICAuY3NzKCdsZWZ0JywgeCArICdweCcpXG4gICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RvcCcsIHkgKyAncHgnKTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLiRicm9hZGNhc3QoJ21hcms6bW92ZWQnLCBbXG4gICAgICAgICAgICAgICAgICAgIHgsIHksIGR4LCBkeSwgb3JpZ2luYWxJbWdbMF0uaGVpZ2h0LCBvcmlnaW5hbEltZ1swXS53aWR0aFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVab29tZWQob3JpZ2luYWxYLCBvcmlnaW5hbFksIG9yaWdpbmFsRHgsIG9yaWdpbmFsRHksIG9yaWdpbmFsSGVpZ2h0LCBvcmlnaW5hbFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHpvb21MdmwgPSBzY29wZS56b29tTHZsO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lZFxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnaGVpZ2h0Jywgem9vbUx2bCAqIG9yaWdpbmFsRHkgKyAncHgnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnd2lkdGgnLCB6b29tTHZsICogb3JpZ2luYWxEeCArICdweCcpO1xuICAgICAgICAgICAgICAgICAgICB6b29tZWRJbWdcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBzY29wZS5zcmMpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCdoZWlnaHQnLCB6b29tTHZsICogb3JpZ2luYWxIZWlnaHQgKyAncHgnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnd2lkdGgnLCB6b29tTHZsICogb3JpZ2luYWxXaWR0aCArICdweCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCdsZWZ0JywgLXpvb21MdmwgKiBvcmlnaW5hbFggKyAncHgnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygndG9wJywgLXpvb21MdmwgKiBvcmlnaW5hbFkgKyAncHgnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlY3Q7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZU9mZnNldChtb3VzZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgcmVjdCA9IHJlY3QgfHwgbW91c2VFdmVudC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldFggPSBtb3VzZUV2ZW50LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldFkgPSBtb3VzZUV2ZW50LmNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFg6IG9mZnNldFgsXG4gICAgICAgICAgICAgICAgICAgIFk6IG9mZnNldFlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCduZ1NyYycsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuc3JjID0gYXR0cnMubmdTcmM7XG4gICAgICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ3pvb21MdmwnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnpvb21MdmwgPSBkYXRhO1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIG1hcmtIZWlnaHQ6ICdAbWFya0hlaWdodCcsXG4gICAgICAgICAgICAgICAgbWFya1dpZHRoOiAnQG1hcmtXaWR0aCcsXG4gICAgICAgICAgICAgICAgc3JjOiAnQHNyYycsXG4gICAgICAgICAgICAgICAgem9vbUx2bDogJ0B6b29tTHZsJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnem9vbS5odG1sJyxcbiAgICAgICAgICAgIGxpbms6IGxpbmtcbiAgICAgICAgfTtcbiAgICB9KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==