(function(window, document, angular) {
'use strict';
angular.module('ngImageZoom', []);//'ngImageZoomTemplates'

angular.module('ngImageZoom').run(['$templateCache', function($templateCache) {
$templateCache.put('ngimagezoom.html','<div class=\"original\">\n    <img ng-src=\"{{src}}\"/>\n</div>\n<div class=\"zoomed\">\n    <img/>\n</div>\n');
}]);

angular
    .module('ngImageZoom')
    .directive('ngImageZoom', function () {
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
            templateUrl: 'ngimagezoom.html',
            link: link
        };
    });

}(window, document, window.angular));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInRlbXBsYXRlcy5qcyIsImRpcmVjdGl2ZXMvbmctaW1hZ2Utem9vbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJuZ2ltYWdlem9vbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCduZ0ltYWdlWm9vbScsIFtdKTsvLyduZ0ltYWdlWm9vbVRlbXBsYXRlcydcbiIsImFuZ3VsYXIubW9kdWxlKCduZ0ltYWdlWm9vbScpLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiR0ZW1wbGF0ZUNhY2hlLnB1dCgnbmdpbWFnZXpvb20uaHRtbCcsJzxkaXYgY2xhc3M9XFxcIm9yaWdpbmFsXFxcIj5cXG4gICAgPGltZyBuZy1zcmM9XFxcInt7c3JjfX1cXFwiLz5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJ6b29tZWRcXFwiPlxcbiAgICA8aW1nLz5cXG48L2Rpdj5cXG4nKTtcbn1dKTtcbiIsImFuZ3VsYXJcbiAgICAubW9kdWxlKCduZ0ltYWdlWm9vbScpXG4gICAgLmRpcmVjdGl2ZSgnbmdJbWFnZVpvb20nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG5cbiAgICAgICAgICAgIHZhciAkID0gYW5ndWxhci5lbGVtZW50LFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsID0gJChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5vcmlnaW5hbCcpKSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEltZyA9IG9yaWdpbmFsLmZpbmQoJ2ltZycpLFxuICAgICAgICAgICAgICAgIHpvb21lZCA9ICQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuem9vbWVkJykpLFxuICAgICAgICAgICAgICAgIHpvb21lZEltZyA9IHpvb21lZC5maW5kKCdpbWcnKTtcblxuICAgICAgICAgICAgdmFyIG1hcmsgPSAkKCc8ZGl2PjwvZGl2PicpXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKCdtYXJrJylcbiAgICAgICAgICAgICAgICAuY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpXG4gICAgICAgICAgICAgICAgLmNzcygnaGVpZ2h0Jywgc2NvcGUubWFya0hlaWdodCArICdweCcpXG4gICAgICAgICAgICAgICAgLmNzcygnd2lkdGgnLCBzY29wZS5tYXJrV2lkdGggKyAncHgnKTtcblxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmQobWFyayk7XG5cbiAgICAgICAgICAgIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmsucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gY2FsY3VsYXRlT2Zmc2V0KGV2dCk7XG4gICAgICAgICAgICAgICAgICAgIG1vdmVNYXJrKG9mZnNldC5YLCBvZmZzZXQuWSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmsuYWRkQ2xhc3MoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gY2FsY3VsYXRlT2Zmc2V0KGV2dCk7XG4gICAgICAgICAgICAgICAgICAgIG1vdmVNYXJrKG9mZnNldC5YLCBvZmZzZXQuWSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignbWFyazptb3ZlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZVpvb21lZC5hcHBseSh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBtb3ZlTWFyayhvZmZzZXRYLCBvZmZzZXRZKSB7XG4gICAgICAgICAgICAgICAgdmFyIGR4ID0gc2NvcGUubWFya1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICBkeSA9IHNjb3BlLm1hcmtIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHggPSBvZmZzZXRYIC0gZHggLyAyLFxuICAgICAgICAgICAgICAgICAgICB5ID0gb2Zmc2V0WSAtIGR5IC8gMjtcblxuICAgICAgICAgICAgICAgIG1hcmtcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsIHggKyAncHgnKVxuICAgICAgICAgICAgICAgICAgICAuY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kYnJvYWRjYXN0KCdtYXJrOm1vdmVkJywgW1xuICAgICAgICAgICAgICAgICAgICB4LCB5LCBkeCwgZHksIG9yaWdpbmFsSW1nWzBdLmhlaWdodCwgb3JpZ2luYWxJbWdbMF0ud2lkdGhcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlWm9vbWVkKG9yaWdpbmFsWCwgb3JpZ2luYWxZLCBvcmlnaW5hbER4LCBvcmlnaW5hbER5LCBvcmlnaW5hbEhlaWdodCwgb3JpZ2luYWxXaWR0aCkge1xuICAgICAgICAgICAgICAgIHZhciB6b29tTHZsID0gc2NvcGUuem9vbUx2bDtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB6b29tZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ2hlaWdodCcsIHpvb21MdmwgKiBvcmlnaW5hbER5ICsgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgem9vbUx2bCAqIG9yaWdpbmFsRHggKyAncHgnKTtcbiAgICAgICAgICAgICAgICAgICAgem9vbWVkSW1nXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignc3JjJywgc2NvcGUuc3JjKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnaGVpZ2h0Jywgem9vbUx2bCAqIG9yaWdpbmFsSGVpZ2h0ICsgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgem9vbUx2bCAqIG9yaWdpbmFsV2lkdGggKyAncHgnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsIC16b29tTHZsICogb3JpZ2luYWxYICsgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RvcCcsIC16b29tTHZsICogb3JpZ2luYWxZICsgJ3B4Jyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZWN0O1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVPZmZzZXQobW91c2VFdmVudCkge1xuICAgICAgICAgICAgICAgIHJlY3QgPSByZWN0IHx8IG1vdXNlRXZlbnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXRYID0gbW91c2VFdmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXRZID0gbW91c2VFdmVudC5jbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBYOiBvZmZzZXRYLFxuICAgICAgICAgICAgICAgICAgICBZOiBvZmZzZXRZXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnbmdTcmMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnNyYyA9IGF0dHJzLm5nU3JjO1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCd6b29tTHZsJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzY29wZS56b29tTHZsID0gZGF0YTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBtYXJrSGVpZ2h0OiAnQG1hcmtIZWlnaHQnLFxuICAgICAgICAgICAgICAgIG1hcmtXaWR0aDogJ0BtYXJrV2lkdGgnLFxuICAgICAgICAgICAgICAgIHNyYzogJ0BzcmMnLFxuICAgICAgICAgICAgICAgIHpvb21Mdmw6ICdAem9vbUx2bCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ25naW1hZ2V6b29tLmh0bWwnLFxuICAgICAgICAgICAgbGluazogbGlua1xuICAgICAgICB9O1xuICAgIH0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9