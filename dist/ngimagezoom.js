(function(window, document, angular) {
'use strict';
angular.module('imageZoom', []);

angular.module('imageZoom').run(['$templateCache', function($templateCache) {
    $templateCache.put('zoom.html','<div class=\"original\">\n    <img ng-src=\"{{imageSrc}}\"/>\n    <div class=\"mark\"></div>\n</div>\n<div class=\"zoomed\">\n\n    <img ng-src=\"{{imageSrc}}\"/>\n\n</div>\n');
}]);

angular
    .module('imageZoom')
    .directive('zoom', ['$sce', function ($sce) {

        function link(scope, element, attrs) {

            var $ = angular.element,
                original = $(element[0].querySelector('.original')),
                originalImg = original.find('img'),
                zoomed = $(element[0].querySelector('.zoomed')),
                zoomedImg = zoomed.find('img'),
                mark = $(original[0].querySelector('.mark')),
                origWidth = originalImg[0].naturalWidth,
                origHeight = originalImg[0].naturalHeight,
                lvlCandidate,
                rect;

            if (!origWidth || !origHeight) {
                originalImg[0].addEventListener('load', function(evt) {
                    console.log('loaded', evt.currentTarget);
                    origWidth = originalImg[0].naturalWidth;
                    origHeight = originalImg[0].naturalHeight;

                    scope.markWidth = zoomed[0].clientWidth / origWidth * original[0].clientWidth;
                    scope.markHeight = zoomed[0].clientWidth / origHeight * original[0].clientHeight;

                    mark.css('height', scope.markHeight + 'px')
                        .css('width', scope.markWidth + 'px');

                    moveMarkRel({x:0.5, y:0.5});
                });
            }

            lvlCandidate = parseFloat(scope.level);
            scope.level =  isNaN(lvlCandidate) ? 1 : lvlCandidate;

            //scope.src = $sce.trustAsResourceUrl(scope.imageSrc);
            //console.log('link', scope.imageSrc);


            //element.append(mark);
            //element

            original
                .on('mouseenter', function (evt) {
                    mark.removeClass('hide');
                    //var offset = calculateOffset(evt);
                    //moveMark(offset.x, offset.y);
                    moveMarkRel(calculateOffsetRelative(evt));
                })
                .on('mouseleave', function (evt) {
                    mark.addClass('hide');
                })
                .on('mousemove', function (evt) {
                    //var offset = calculateOffset(evt);
                    //console.log('offsetRel', calculateOffsetRelative(evt));
                    //moveMark(offset.x, offset.y);
                    moveMarkRel(calculateOffsetRelative(evt));
                });

            scope.$on('mark:moved', function (event, data) {
                //updateZoomed.apply(this, data);
                updateZoomedRel.apply(this, data);
            });

            /*
            function moveMark(offsetX, offsetY) {
                var dx = scope.markWidth,
                    dy = scope.markHeight,
                    x = offsetX, // - dx / 2,
                    y = offsetY; // - dy / 2;

                mark
                    .css('left', x + 'px')
                    .css('top', y + 'px');

                scope.$broadcast('mark:moved', [
                    x, y, dx, dy, origHeight, origWidth
                ]);
            }*/

            function moveMarkRel(offsetRel) {

                var dx = scope.markWidth,
                    dy = scope.markHeight,
                    x = offsetRel.x * original[0].clientWidth - dx *.5,
                    y = offsetRel.y * original[0].clientHeight - dy * .5;

                mark
                    .css('left', x + 'px')
                    .css('top',  y + 'px');


                scope.$broadcast('mark:moved', [
                    offsetRel
                ]);

            }

            function updateZoomedRel(offsetRel) {
                console.log('ofdsetRel', offsetRel);
                scope.$apply(function () {
                    zoomedImg
                        .css('left', ((zoomed[0].clientWidth - origWidth)  * (offsetRel.x )) + 'px')
                        .css('top',  ((zoomed[0].clientHeight - origHeight) * (offsetRel.y )) + 'px');
                });
            }

            function updateZoomed(originalX, originalY, originalDx, originalDy, originalHeight, originalWidth) {

                //var zoomLvl = scope.level;

                scope.$apply(function () {
                    //console.log('update zoomedCanvas', zoomLvl, originalX, originalY, originalDx, originalDy, originalHeight, originalWidth);
                    /*zoomedCanvas
                        .css('height', zoomLvl * originalDy + 'px')
                        .css('width', zoomLvl * originalDx + 'px');*/

                    zoomedImg
                        //.attr('src', scope.imageSrc)
                        //.css('height', zoomLvl * originalHeight + 'px')
                        //.css('width', zoomLvl * originalWidth + 'px')
                        .css('left', -zoomLvl * originalX + 'px')
                        .css('top', -zoomLvl * originalY + 'px');
                });
            }



            function calculateOffset(mouseEvent) {
                rect = rect || mouseEvent.currentTarget.getBoundingClientRect();

                return {
                    x: mouseEvent.clientX - rect.left,
                    y: mouseEvent.clientY - rect.top
                }
            }

            function calculateOffsetRelative(mouseEvent) {
                var offsetPix = calculateOffset(mouseEvent);

                return {
                    x: offsetPix.x / mouseEvent.currentTarget.clientWidth,
                    y: offsetPix.y / mouseEvent.currentTarget.clientHeight
                }
            }

            attrs.$observe('ngSrc', function (data) {
                console.log('update src', data, attrs.ngSrc);
                scope.imageSrc = attrs.ngSrc;
            }, true);

            attrs.$observe('level', function (data) {
                console.log('update level', data);
                scope.level = data;
            }, true);
        }

        return {
            restrict: 'EA',
            scope: {
                imageSrc: '@zoomImageSrc',
                level: '@zoomLevel'
            },
            templateUrl: 'zoom.html',
            link: link
        };
    }]);

}(window, document, window.angular));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInRlbXBsYXRlcy5qcyIsImRpcmVjdGl2ZXMvem9vbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJuZ2ltYWdlem9vbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdpbWFnZVpvb20nLCBbXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnaW1hZ2Vab29tJykucnVuKFsnJHRlbXBsYXRlQ2FjaGUnLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkge1xuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnem9vbS5odG1sJywnPGRpdiBjbGFzcz1cXFwib3JpZ2luYWxcXFwiPlxcbiAgICA8aW1nIG5nLXNyYz1cXFwie3tpbWFnZVNyY319XFxcIi8+XFxuICAgIDxkaXYgY2xhc3M9XFxcIm1hcmtcXFwiPjwvZGl2PlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInpvb21lZFxcXCI+XFxuXFxuICAgIDxpbWcgbmctc3JjPVxcXCJ7e2ltYWdlU3JjfX1cXFwiLz5cXG5cXG48L2Rpdj5cXG4nKTtcbn1dKTtcbiIsImFuZ3VsYXJcbiAgICAubW9kdWxlKCdpbWFnZVpvb20nKVxuICAgIC5kaXJlY3RpdmUoJ3pvb20nLCBbJyRzY2UnLCBmdW5jdGlvbiAoJHNjZSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG5cbiAgICAgICAgICAgIHZhciAkID0gYW5ndWxhci5lbGVtZW50LFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsID0gJChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy5vcmlnaW5hbCcpKSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEltZyA9IG9yaWdpbmFsLmZpbmQoJ2ltZycpLFxuICAgICAgICAgICAgICAgIHpvb21lZCA9ICQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuem9vbWVkJykpLFxuICAgICAgICAgICAgICAgIHpvb21lZEltZyA9IHpvb21lZC5maW5kKCdpbWcnKSxcbiAgICAgICAgICAgICAgICBtYXJrID0gJChvcmlnaW5hbFswXS5xdWVyeVNlbGVjdG9yKCcubWFyaycpKSxcbiAgICAgICAgICAgICAgICBvcmlnV2lkdGggPSBvcmlnaW5hbEltZ1swXS5uYXR1cmFsV2lkdGgsXG4gICAgICAgICAgICAgICAgb3JpZ0hlaWdodCA9IG9yaWdpbmFsSW1nWzBdLm5hdHVyYWxIZWlnaHQsXG4gICAgICAgICAgICAgICAgbHZsQ2FuZGlkYXRlLFxuICAgICAgICAgICAgICAgIHJlY3Q7XG5cbiAgICAgICAgICAgIGlmICghb3JpZ1dpZHRoIHx8ICFvcmlnSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxJbWdbMF0uYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZGVkJywgZXZ0LmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICBvcmlnV2lkdGggPSBvcmlnaW5hbEltZ1swXS5uYXR1cmFsV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdIZWlnaHQgPSBvcmlnaW5hbEltZ1swXS5uYXR1cmFsSGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm1hcmtXaWR0aCA9IHpvb21lZFswXS5jbGllbnRXaWR0aCAvIG9yaWdXaWR0aCAqIG9yaWdpbmFsWzBdLmNsaWVudFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5tYXJrSGVpZ2h0ID0gem9vbWVkWzBdLmNsaWVudFdpZHRoIC8gb3JpZ0hlaWdodCAqIG9yaWdpbmFsWzBdLmNsaWVudEhlaWdodDtcblxuICAgICAgICAgICAgICAgICAgICBtYXJrLmNzcygnaGVpZ2h0Jywgc2NvcGUubWFya0hlaWdodCArICdweCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCd3aWR0aCcsIHNjb3BlLm1hcmtXaWR0aCArICdweCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIG1vdmVNYXJrUmVsKHt4OjAuNSwgeTowLjV9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbHZsQ2FuZGlkYXRlID0gcGFyc2VGbG9hdChzY29wZS5sZXZlbCk7XG4gICAgICAgICAgICBzY29wZS5sZXZlbCA9ICBpc05hTihsdmxDYW5kaWRhdGUpID8gMSA6IGx2bENhbmRpZGF0ZTtcblxuICAgICAgICAgICAgLy9zY29wZS5zcmMgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybChzY29wZS5pbWFnZVNyYyk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdsaW5rJywgc2NvcGUuaW1hZ2VTcmMpO1xuXG5cbiAgICAgICAgICAgIC8vZWxlbWVudC5hcHBlbmQobWFyayk7XG4gICAgICAgICAgICAvL2VsZW1lbnRcblxuICAgICAgICAgICAgb3JpZ2luYWxcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmsucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgLy92YXIgb2Zmc2V0ID0gY2FsY3VsYXRlT2Zmc2V0KGV2dCk7XG4gICAgICAgICAgICAgICAgICAgIC8vbW92ZU1hcmsob2Zmc2V0LngsIG9mZnNldC55KTtcbiAgICAgICAgICAgICAgICAgICAgbW92ZU1hcmtSZWwoY2FsY3VsYXRlT2Zmc2V0UmVsYXRpdmUoZXZ0KSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmsuYWRkQ2xhc3MoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgICAgICAgICAgICAvL3ZhciBvZmZzZXQgPSBjYWxjdWxhdGVPZmZzZXQoZXZ0KTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnb2Zmc2V0UmVsJywgY2FsY3VsYXRlT2Zmc2V0UmVsYXRpdmUoZXZ0KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vbW92ZU1hcmsob2Zmc2V0LngsIG9mZnNldC55KTtcbiAgICAgICAgICAgICAgICAgICAgbW92ZU1hcmtSZWwoY2FsY3VsYXRlT2Zmc2V0UmVsYXRpdmUoZXZ0KSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignbWFyazptb3ZlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vdXBkYXRlWm9vbWVkLmFwcGx5KHRoaXMsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZVpvb21lZFJlbC5hcHBseSh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgZnVuY3Rpb24gbW92ZU1hcmsob2Zmc2V0WCwgb2Zmc2V0WSkge1xuICAgICAgICAgICAgICAgIHZhciBkeCA9IHNjb3BlLm1hcmtXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgZHkgPSBzY29wZS5tYXJrSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB4ID0gb2Zmc2V0WCwgLy8gLSBkeCAvIDIsXG4gICAgICAgICAgICAgICAgICAgIHkgPSBvZmZzZXRZOyAvLyAtIGR5IC8gMjtcblxuICAgICAgICAgICAgICAgIG1hcmtcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsIHggKyAncHgnKVxuICAgICAgICAgICAgICAgICAgICAuY3NzKCd0b3AnLCB5ICsgJ3B4Jyk7XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kYnJvYWRjYXN0KCdtYXJrOm1vdmVkJywgW1xuICAgICAgICAgICAgICAgICAgICB4LCB5LCBkeCwgZHksIG9yaWdIZWlnaHQsIG9yaWdXaWR0aFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSovXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG1vdmVNYXJrUmVsKG9mZnNldFJlbCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGR4ID0gc2NvcGUubWFya1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICBkeSA9IHNjb3BlLm1hcmtIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHggPSBvZmZzZXRSZWwueCAqIG9yaWdpbmFsWzBdLmNsaWVudFdpZHRoIC0gZHggKi41LFxuICAgICAgICAgICAgICAgICAgICB5ID0gb2Zmc2V0UmVsLnkgKiBvcmlnaW5hbFswXS5jbGllbnRIZWlnaHQgLSBkeSAqIC41O1xuXG4gICAgICAgICAgICAgICAgbWFya1xuICAgICAgICAgICAgICAgICAgICAuY3NzKCdsZWZ0JywgeCArICdweCcpXG4gICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RvcCcsICB5ICsgJ3B4Jyk7XG5cblxuICAgICAgICAgICAgICAgIHNjb3BlLiRicm9hZGNhc3QoJ21hcms6bW92ZWQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldFJlbFxuICAgICAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVpvb21lZFJlbChvZmZzZXRSZWwpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb2Zkc2V0UmVsJywgb2Zmc2V0UmVsKTtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB6b29tZWRJbWdcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ2xlZnQnLCAoKHpvb21lZFswXS5jbGllbnRXaWR0aCAtIG9yaWdXaWR0aCkgICogKG9mZnNldFJlbC54ICkpICsgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RvcCcsICAoKHpvb21lZFswXS5jbGllbnRIZWlnaHQgLSBvcmlnSGVpZ2h0KSAqIChvZmZzZXRSZWwueSApKSArICdweCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVab29tZWQob3JpZ2luYWxYLCBvcmlnaW5hbFksIG9yaWdpbmFsRHgsIG9yaWdpbmFsRHksIG9yaWdpbmFsSGVpZ2h0LCBvcmlnaW5hbFdpZHRoKSB7XG5cbiAgICAgICAgICAgICAgICAvL3ZhciB6b29tTHZsID0gc2NvcGUubGV2ZWw7XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCd1cGRhdGUgem9vbWVkQ2FudmFzJywgem9vbUx2bCwgb3JpZ2luYWxYLCBvcmlnaW5hbFksIG9yaWdpbmFsRHgsIG9yaWdpbmFsRHksIG9yaWdpbmFsSGVpZ2h0LCBvcmlnaW5hbFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgLyp6b29tZWRDYW52YXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ2hlaWdodCcsIHpvb21MdmwgKiBvcmlnaW5hbER5ICsgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgem9vbUx2bCAqIG9yaWdpbmFsRHggKyAncHgnKTsqL1xuXG4gICAgICAgICAgICAgICAgICAgIHpvb21lZEltZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8uYXR0cignc3JjJywgc2NvcGUuaW1hZ2VTcmMpXG4gICAgICAgICAgICAgICAgICAgICAgICAvLy5jc3MoJ2hlaWdodCcsIHpvb21MdmwgKiBvcmlnaW5hbEhlaWdodCArICdweCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAvLy5jc3MoJ3dpZHRoJywgem9vbUx2bCAqIG9yaWdpbmFsV2lkdGggKyAncHgnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsIC16b29tTHZsICogb3JpZ2luYWxYICsgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RvcCcsIC16b29tTHZsICogb3JpZ2luYWxZICsgJ3B4Jyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cblxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVPZmZzZXQobW91c2VFdmVudCkge1xuICAgICAgICAgICAgICAgIHJlY3QgPSByZWN0IHx8IG1vdXNlRXZlbnQuY3VycmVudFRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IG1vdXNlRXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgeTogbW91c2VFdmVudC5jbGllbnRZIC0gcmVjdC50b3BcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZU9mZnNldFJlbGF0aXZlKG1vdXNlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0UGl4ID0gY2FsY3VsYXRlT2Zmc2V0KG1vdXNlRXZlbnQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgeDogb2Zmc2V0UGl4LnggLyBtb3VzZUV2ZW50LmN1cnJlbnRUYXJnZXQuY2xpZW50V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIHk6IG9mZnNldFBpeC55IC8gbW91c2VFdmVudC5jdXJyZW50VGFyZ2V0LmNsaWVudEhlaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ25nU3JjJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlIHNyYycsIGRhdGEsIGF0dHJzLm5nU3JjKTtcbiAgICAgICAgICAgICAgICBzY29wZS5pbWFnZVNyYyA9IGF0dHJzLm5nU3JjO1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCdsZXZlbCcsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZSBsZXZlbCcsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHNjb3BlLmxldmVsID0gZGF0YTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBpbWFnZVNyYzogJ0B6b29tSW1hZ2VTcmMnLFxuICAgICAgICAgICAgICAgIGxldmVsOiAnQHpvb21MZXZlbCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3pvb20uaHRtbCcsXG4gICAgICAgICAgICBsaW5rOiBsaW5rXG4gICAgICAgIH07XG4gICAgfV0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9