(function(window, document, angular) {
'use strict';
angular.module('imageZoom', []);

angular.module('imageZoom').run(['$templateCache', function($templateCache) {
    $templateCache.put('zoom-control.html','<div class=\"zoom-control__clip\">\r\n    <img ng-src=\"{{imageSrc}}\"/>\r\n    <div class=\"mark\"></div>\r\n</div>\r\n');

    $templateCache.put('zoom-image-container.html','<div class=\"zoom-image-container__clip\">\r\n    <img ng-src=\"{{imageSrc}}\"/>\r\n</div>\r\n');
}]);

angular
    .module('imageZoom')
    .directive('zoomControl', ['$rootScope', function ($rootScope) {

        function link(scope, element, attrs, ctrl) {

            var $ = angular.element,
                clip = $(element[0].querySelector('.zoom-control__clip')),
                image = clip.find('img'),
                mark = $(clip[0].querySelector('.mark')),
                origWidth = image[0].naturalWidth,
                origHeight = image[0].naturalHeight,
                markBoundingRect = mark[0].getBoundingClientRect();

            console.log('clip', clip);

            scope.imageSrc = ctrl.getImageUrl();
            scope.imageContainerElem = ctrl.getImageContainerElem();
            scope.imageContainerElemZoomed = scope.imageContainerElem[0].querySelector('.zoom-image-container__clip');
            console.log('container_clip', scope.imageContainerElemZoomed);

            scope.$on('zoom-imagesrc:changed', function(evt, newSrc) {
                scope.imageSrc = newSrc;
            });

            if (!origWidth || !origHeight) {
                image[0].addEventListener('load', onImageLoaded);
            }

            function onImageLoaded(evt) {
                console.log('loaded', evt.currentTarget);

                origWidth = image[0].naturalWidth;
                origHeight = image[0].naturalHeight;

                ctrl.setOrigDimensions(origWidth, origHeight);

                if(scope.imageContainerElem && scope.imageContainerElem.length > 0) {

                    if(scope.imageContainerElemZoomed) {
                        initMark();
                    } else {
                        scope.$on('zoom-imagecontainer:found', initMark());
                    }

                }
                $rootScope.$broadcast('zoom-image:loaded');


            }

            //scope.level =  isNaN(lvlCandidate) ? 1 : lvlCandidate;
            function initMark() {
                var imageContainerHeight;

                console.log('clip', clip);
                console.log('container_clip', scope.imageContainerElemZoomed);

                scope.markWidth = scope.imageContainerElemZoomed.clientWidth / origWidth * clip[0].clientWidth;

                //console.log('width', scope.imageContainerElemZoomed.clientWidth, origHeight / origWidth);
                imageContainerHeight = scope.imageContainerElemZoomed.clientWidth * (origHeight/origWidth);

                scope.markHeight = imageContainerHeight / origHeight * clip[0].clientHeight;

                mark.css('height', scope.markHeight + 'px')
                    .css('width', scope.markWidth + 'px');


                //moveMarkRel({x:0.5, y:0.5});
            }

            function onMouseMove(evt) {
                moveMarkRel(calculateOffsetRelative(evt));
            }

            clip.on('mouseenter', function (evt) {
                //console.log('enter');
                moveMarkRel(calculateOffsetRelative(evt));
                clip.on('mousemove', onMouseMove);
            });

            clip.on('mouseleave', function (evt) {
                //console.log('leave');
                clip.off('mousemove', onMouseMove);
            });

            function moveMarkRel(offsetRel) {

                var dx = scope.markWidth,
                    dy = scope.markHeight,
                    x = offsetRel.x * clip[0].clientWidth - dx *.5,
                    y = offsetRel.y * clip[0].clientHeight - dy * .5,
                    verti = clip[0].clientHeight / scope.markHeight, //1.9;
                    hori =  clip[0].clientWidth / scope.markWidth;//2;


                mark
                    .css('left', x + 'px')
                    .css('top',  y + 'px');

                $rootScope.$broadcast('mark:moved', [{x:offsetRel.x*(1+hori)-(hori *.5), y:offsetRel.y*(1+verti)-(verti *.5)}]);

            }

            function calculateOffsetRelative(mouseEvent) {

                markBoundingRect = markBoundingRect || mouseEvent.currentTarget.getBoundingClientRect();

                return {
                    x: (mouseEvent.clientX - markBoundingRect.left) / (mouseEvent.currentTarget.clientWidth),
                    y: (mouseEvent.clientY - markBoundingRect.top) / mouseEvent.currentTarget.clientHeight
                }
            }
        }

        return {
            restrict: 'A',
            require: '^zoom',
            scope: {},
            templateUrl: 'zoom-control.html',
            link: link
        };
    }]);

angular
    .module('imageZoom')
    .directive('zoomImageContainer', [function () {

        function link(scope, element, attrs, ctrl) {

            var $ = angular.element,
                zoomed = $(element[0].querySelector('.zoom-image-container__clip')),
                zoomedImg = zoomed.find('img');

            scope.imageSrc = ctrl.getImageUrl();

            scope.$on('zoom-image:loaded', function(event) {
                var imageContainerHeight;

                scope.origDimensions = ctrl.getOrigDimensions();
                imageContainerHeight = zoomed[0].clientWidth * (scope.origDimensions.height/scope.origDimensions.width);
                console.log('imageContainerHeight', imageContainerHeight);

                zoomed
                    .css('height', imageContainerHeight + 'px');

            });

            scope.$on('mark:moved', function (event, data) {
                updateZoomedRel.apply(this, data);
            });

            scope.$on('zoom-imagesrc:changed', function(evt, newSrc) {
                scope.imageSrc = newSrc;
            });

            function updateZoomedRel(offsetRel) {
                scope.$apply(function () {
                    zoomedImg
                        .css('left', ((zoomed[0].clientWidth - scope.origDimensions.width)  * (offsetRel.x )) + 'px')
                        .css('top',  ((zoomed[0].clientHeight - scope.origDimensions.height) * (offsetRel.y )) + 'px');
                });
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
            restrict: 'A',
            require: '^zoom',
            scope: {},
            templateUrl: 'zoom-image-container.html',
            link: link
        };
    }]);

angular
    .module('imageZoom')
    .directive('zoom', ['$rootScope', function ($rootScope) {


        function link(scope, element, attrs) {
            var $ = angular.element;
            scope.controlElem = $(element[0].querySelector('[zoom-control]'));
            scope.imageContainerElem = $(element[0].querySelector('[zoom-image-container]'));

            scope.$broadcast('zoom-control:found', scope.controlElem);
            scope.$broadcast('zoom-imagecontainer:found', scope.imageContainerElem);

            //console.log('zoomImageContainerElem', scope.imageContainerElem);

            attrs.$observe('zoomImagesrc', function (data) {
                console.log('update src', data, attrs.zoom);
                scope.imageSrc = attrs.zoomImagesrc;
                $rootScope.$broadcast('zoom-imagesrc:changed', attrs.zoomImagesrc);
            }, true);

            attrs.$observe('level', function (data) {
                //console.log('update level', data);
                scope.level = data;
            }, true);

        }

        return {
            restrict: 'EA',
            scope: {
                imageSrc: '@zoomImagesrc'
            },
            link: link,
            controller: function($scope) {


                this.getImageUrl = function() {
                    return $scope.imageSrc;
                };

                this.getControlElem = function() {
                    return $scope.controlElem;
                };

                this.getImageContainerElem = function() {
                    return $scope.imageContainerElem;
                };

                this.setOrigDimensions = function(origWidth, origHeight) {
                    $scope.origWidth = origWidth;
                    $scope.origHeight = origHeight;
                };

                this.getOrigDimensions = function() {
                    return {
                        width: $scope.origWidth,
                        height: $scope.origHeight
                    };
                };
            }
        };
    }]);

}(window, document, window.angular));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInRlbXBsYXRlcy5qcyIsImRpcmVjdGl2ZXMvem9vbS1jb250cm9sLmpzIiwiZGlyZWN0aXZlcy96b29tLWltYWdlLWNvbnRhaW5lci5qcyIsImRpcmVjdGl2ZXMvem9vbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmdpbWFnZXpvb20uanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnaW1hZ2Vab29tJywgW10pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2ltYWdlWm9vbScpLnJ1bihbJyR0ZW1wbGF0ZUNhY2hlJywgZnVuY3Rpb24oJHRlbXBsYXRlQ2FjaGUpIHtcbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3pvb20tY29udHJvbC5odG1sJywnPGRpdiBjbGFzcz1cXFwiem9vbS1jb250cm9sX19jbGlwXFxcIj5cXHJcXG4gICAgPGltZyBuZy1zcmM9XFxcInt7aW1hZ2VTcmN9fVxcXCIvPlxcclxcbiAgICA8ZGl2IGNsYXNzPVxcXCJtYXJrXFxcIj48L2Rpdj5cXHJcXG48L2Rpdj5cXHJcXG4nKTtcblxuICAgICR0ZW1wbGF0ZUNhY2hlLnB1dCgnem9vbS1pbWFnZS1jb250YWluZXIuaHRtbCcsJzxkaXYgY2xhc3M9XFxcInpvb20taW1hZ2UtY29udGFpbmVyX19jbGlwXFxcIj5cXHJcXG4gICAgPGltZyBuZy1zcmM9XFxcInt7aW1hZ2VTcmN9fVxcXCIvPlxcclxcbjwvZGl2PlxcclxcbicpO1xufV0pO1xuIiwiYW5ndWxhclxuICAgIC5tb2R1bGUoJ2ltYWdlWm9vbScpXG4gICAgLmRpcmVjdGl2ZSgnem9vbUNvbnRyb2wnLCBbJyRyb290U2NvcGUnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG5cbiAgICAgICAgICAgIHZhciAkID0gYW5ndWxhci5lbGVtZW50LFxuICAgICAgICAgICAgICAgIGNsaXAgPSAkKGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLnpvb20tY29udHJvbF9fY2xpcCcpKSxcbiAgICAgICAgICAgICAgICBpbWFnZSA9IGNsaXAuZmluZCgnaW1nJyksXG4gICAgICAgICAgICAgICAgbWFyayA9ICQoY2xpcFswXS5xdWVyeVNlbGVjdG9yKCcubWFyaycpKSxcbiAgICAgICAgICAgICAgICBvcmlnV2lkdGggPSBpbWFnZVswXS5uYXR1cmFsV2lkdGgsXG4gICAgICAgICAgICAgICAgb3JpZ0hlaWdodCA9IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQsXG4gICAgICAgICAgICAgICAgbWFya0JvdW5kaW5nUmVjdCA9IG1hcmtbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbGlwJywgY2xpcCk7XG5cbiAgICAgICAgICAgIHNjb3BlLmltYWdlU3JjID0gY3RybC5nZXRJbWFnZVVybCgpO1xuICAgICAgICAgICAgc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtID0gY3RybC5nZXRJbWFnZUNvbnRhaW5lckVsZW0oKTtcbiAgICAgICAgICAgIHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbVpvb21lZCA9IHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbVswXS5xdWVyeVNlbGVjdG9yKCcuem9vbS1pbWFnZS1jb250YWluZXJfX2NsaXAnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjb250YWluZXJfY2xpcCcsIHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbVpvb21lZCk7XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignem9vbS1pbWFnZXNyYzpjaGFuZ2VkJywgZnVuY3Rpb24oZXZ0LCBuZXdTcmMpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5pbWFnZVNyYyA9IG5ld1NyYztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIW9yaWdXaWR0aCB8fCAhb3JpZ0hlaWdodCkge1xuICAgICAgICAgICAgICAgIGltYWdlWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkltYWdlTG9hZGVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gb25JbWFnZUxvYWRlZChldnQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9hZGVkJywgZXZ0LmN1cnJlbnRUYXJnZXQpO1xuXG4gICAgICAgICAgICAgICAgb3JpZ1dpZHRoID0gaW1hZ2VbMF0ubmF0dXJhbFdpZHRoO1xuICAgICAgICAgICAgICAgIG9yaWdIZWlnaHQgPSBpbWFnZVswXS5uYXR1cmFsSGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgY3RybC5zZXRPcmlnRGltZW5zaW9ucyhvcmlnV2lkdGgsIG9yaWdIZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgaWYoc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtICYmIHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbS5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtWm9vbWVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFyaygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJG9uKCd6b29tLWltYWdlY29udGFpbmVyOmZvdW5kJywgaW5pdE1hcmsoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3pvb20taW1hZ2U6bG9hZGVkJyk7XG5cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL3Njb3BlLmxldmVsID0gIGlzTmFOKGx2bENhbmRpZGF0ZSkgPyAxIDogbHZsQ2FuZGlkYXRlO1xuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcmsoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltYWdlQ29udGFpbmVySGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NsaXAnLCBjbGlwKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY29udGFpbmVyX2NsaXAnLCBzY29wZS5pbWFnZUNvbnRhaW5lckVsZW1ab29tZWQpO1xuXG4gICAgICAgICAgICAgICAgc2NvcGUubWFya1dpZHRoID0gc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtWm9vbWVkLmNsaWVudFdpZHRoIC8gb3JpZ1dpZHRoICogY2xpcFswXS5jbGllbnRXaWR0aDtcblxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3dpZHRoJywgc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtWm9vbWVkLmNsaWVudFdpZHRoLCBvcmlnSGVpZ2h0IC8gb3JpZ1dpZHRoKTtcbiAgICAgICAgICAgICAgICBpbWFnZUNvbnRhaW5lckhlaWdodCA9IHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbVpvb21lZC5jbGllbnRXaWR0aCAqIChvcmlnSGVpZ2h0L29yaWdXaWR0aCk7XG5cbiAgICAgICAgICAgICAgICBzY29wZS5tYXJrSGVpZ2h0ID0gaW1hZ2VDb250YWluZXJIZWlnaHQgLyBvcmlnSGVpZ2h0ICogY2xpcFswXS5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICBtYXJrLmNzcygnaGVpZ2h0Jywgc2NvcGUubWFya0hlaWdodCArICdweCcpXG4gICAgICAgICAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgc2NvcGUubWFya1dpZHRoICsgJ3B4Jyk7XG5cblxuICAgICAgICAgICAgICAgIC8vbW92ZU1hcmtSZWwoe3g6MC41LCB5OjAuNX0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBvbk1vdXNlTW92ZShldnQpIHtcbiAgICAgICAgICAgICAgICBtb3ZlTWFya1JlbChjYWxjdWxhdGVPZmZzZXRSZWxhdGl2ZShldnQpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xpcC5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdlbnRlcicpO1xuICAgICAgICAgICAgICAgIG1vdmVNYXJrUmVsKGNhbGN1bGF0ZU9mZnNldFJlbGF0aXZlKGV2dCkpO1xuICAgICAgICAgICAgICAgIGNsaXAub24oJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjbGlwLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2xlYXZlJyk7XG4gICAgICAgICAgICAgICAgY2xpcC5vZmYoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBtb3ZlTWFya1JlbChvZmZzZXRSZWwpIHtcblxuICAgICAgICAgICAgICAgIHZhciBkeCA9IHNjb3BlLm1hcmtXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgZHkgPSBzY29wZS5tYXJrSGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB4ID0gb2Zmc2V0UmVsLnggKiBjbGlwWzBdLmNsaWVudFdpZHRoIC0gZHggKi41LFxuICAgICAgICAgICAgICAgICAgICB5ID0gb2Zmc2V0UmVsLnkgKiBjbGlwWzBdLmNsaWVudEhlaWdodCAtIGR5ICogLjUsXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpID0gY2xpcFswXS5jbGllbnRIZWlnaHQgLyBzY29wZS5tYXJrSGVpZ2h0LCAvLzEuOTtcbiAgICAgICAgICAgICAgICAgICAgaG9yaSA9ICBjbGlwWzBdLmNsaWVudFdpZHRoIC8gc2NvcGUubWFya1dpZHRoOy8vMjtcblxuXG4gICAgICAgICAgICAgICAgbWFya1xuICAgICAgICAgICAgICAgICAgICAuY3NzKCdsZWZ0JywgeCArICdweCcpXG4gICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RvcCcsICB5ICsgJ3B4Jyk7XG5cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ21hcms6bW92ZWQnLCBbe3g6b2Zmc2V0UmVsLngqKDEraG9yaSktKGhvcmkgKi41KSwgeTpvZmZzZXRSZWwueSooMSt2ZXJ0aSktKHZlcnRpICouNSl9XSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlT2Zmc2V0UmVsYXRpdmUobW91c2VFdmVudCkge1xuXG4gICAgICAgICAgICAgICAgbWFya0JvdW5kaW5nUmVjdCA9IG1hcmtCb3VuZGluZ1JlY3QgfHwgbW91c2VFdmVudC5jdXJyZW50VGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgeDogKG1vdXNlRXZlbnQuY2xpZW50WCAtIG1hcmtCb3VuZGluZ1JlY3QubGVmdCkgLyAobW91c2VFdmVudC5jdXJyZW50VGFyZ2V0LmNsaWVudFdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgeTogKG1vdXNlRXZlbnQuY2xpZW50WSAtIG1hcmtCb3VuZGluZ1JlY3QudG9wKSAvIG1vdXNlRXZlbnQuY3VycmVudFRhcmdldC5jbGllbnRIZWlnaHRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIHJlcXVpcmU6ICdeem9vbScsXG4gICAgICAgICAgICBzY29wZToge30sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3pvb20tY29udHJvbC5odG1sJyxcbiAgICAgICAgICAgIGxpbms6IGxpbmtcbiAgICAgICAgfTtcbiAgICB9XSk7XG4iLCJhbmd1bGFyXG4gICAgLm1vZHVsZSgnaW1hZ2Vab29tJylcbiAgICAuZGlyZWN0aXZlKCd6b29tSW1hZ2VDb250YWluZXInLCBbZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XG5cbiAgICAgICAgICAgIHZhciAkID0gYW5ndWxhci5lbGVtZW50LFxuICAgICAgICAgICAgICAgIHpvb21lZCA9ICQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCcuem9vbS1pbWFnZS1jb250YWluZXJfX2NsaXAnKSksXG4gICAgICAgICAgICAgICAgem9vbWVkSW1nID0gem9vbWVkLmZpbmQoJ2ltZycpO1xuXG4gICAgICAgICAgICBzY29wZS5pbWFnZVNyYyA9IGN0cmwuZ2V0SW1hZ2VVcmwoKTtcblxuICAgICAgICAgICAgc2NvcGUuJG9uKCd6b29tLWltYWdlOmxvYWRlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGltYWdlQ29udGFpbmVySGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgc2NvcGUub3JpZ0RpbWVuc2lvbnMgPSBjdHJsLmdldE9yaWdEaW1lbnNpb25zKCk7XG4gICAgICAgICAgICAgICAgaW1hZ2VDb250YWluZXJIZWlnaHQgPSB6b29tZWRbMF0uY2xpZW50V2lkdGggKiAoc2NvcGUub3JpZ0RpbWVuc2lvbnMuaGVpZ2h0L3Njb3BlLm9yaWdEaW1lbnNpb25zLndpZHRoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaW1hZ2VDb250YWluZXJIZWlnaHQnLCBpbWFnZUNvbnRhaW5lckhlaWdodCk7XG5cbiAgICAgICAgICAgICAgICB6b29tZWRcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnaGVpZ2h0JywgaW1hZ2VDb250YWluZXJIZWlnaHQgKyAncHgnKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignbWFyazptb3ZlZCcsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZVpvb21lZFJlbC5hcHBseSh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzY29wZS4kb24oJ3pvb20taW1hZ2VzcmM6Y2hhbmdlZCcsIGZ1bmN0aW9uKGV2dCwgbmV3U3JjKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuaW1hZ2VTcmMgPSBuZXdTcmM7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlWm9vbWVkUmVsKG9mZnNldFJlbCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHpvb21lZEltZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsICgoem9vbWVkWzBdLmNsaWVudFdpZHRoIC0gc2NvcGUub3JpZ0RpbWVuc2lvbnMud2lkdGgpICAqIChvZmZzZXRSZWwueCApKSArICdweCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY3NzKCd0b3AnLCAgKCh6b29tZWRbMF0uY2xpZW50SGVpZ2h0IC0gc2NvcGUub3JpZ0RpbWVuc2lvbnMuaGVpZ2h0KSAqIChvZmZzZXRSZWwueSApKSArICdweCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnbmdTcmMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGUgc3JjJywgZGF0YSwgYXR0cnMubmdTcmMpO1xuICAgICAgICAgICAgICAgIHNjb3BlLmltYWdlU3JjID0gYXR0cnMubmdTcmM7XG4gICAgICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2xldmVsJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlIGxldmVsJywgZGF0YSk7XG4gICAgICAgICAgICAgICAgc2NvcGUubGV2ZWwgPSBkYXRhO1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIHJlcXVpcmU6ICdeem9vbScsXG4gICAgICAgICAgICBzY29wZToge30sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3pvb20taW1hZ2UtY29udGFpbmVyLmh0bWwnLFxuICAgICAgICAgICAgbGluazogbGlua1xuICAgICAgICB9O1xuICAgIH1dKTtcbiIsImFuZ3VsYXJcbiAgICAubW9kdWxlKCdpbWFnZVpvb20nKVxuICAgIC5kaXJlY3RpdmUoJ3pvb20nLCBbJyRyb290U2NvcGUnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xuXG5cbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgICAgIHZhciAkID0gYW5ndWxhci5lbGVtZW50O1xuICAgICAgICAgICAgc2NvcGUuY29udHJvbEVsZW0gPSAkKGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW3pvb20tY29udHJvbF0nKSk7XG4gICAgICAgICAgICBzY29wZS5pbWFnZUNvbnRhaW5lckVsZW0gPSAkKGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW3pvb20taW1hZ2UtY29udGFpbmVyXScpKTtcblxuICAgICAgICAgICAgc2NvcGUuJGJyb2FkY2FzdCgnem9vbS1jb250cm9sOmZvdW5kJywgc2NvcGUuY29udHJvbEVsZW0pO1xuICAgICAgICAgICAgc2NvcGUuJGJyb2FkY2FzdCgnem9vbS1pbWFnZWNvbnRhaW5lcjpmb3VuZCcsIHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbSk7XG5cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3pvb21JbWFnZUNvbnRhaW5lckVsZW0nLCBzY29wZS5pbWFnZUNvbnRhaW5lckVsZW0pO1xuXG4gICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnem9vbUltYWdlc3JjJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlIHNyYycsIGRhdGEsIGF0dHJzLnpvb20pO1xuICAgICAgICAgICAgICAgIHNjb3BlLmltYWdlU3JjID0gYXR0cnMuem9vbUltYWdlc3JjO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnem9vbS1pbWFnZXNyYzpjaGFuZ2VkJywgYXR0cnMuem9vbUltYWdlc3JjKTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnbGV2ZWwnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZSBsZXZlbCcsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHNjb3BlLmxldmVsID0gZGF0YTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGltYWdlU3JjOiAnQHpvb21JbWFnZXNyYydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsaW5rOiBsaW5rLFxuICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKSB7XG5cblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0SW1hZ2VVcmwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5pbWFnZVNyYztcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRDb250cm9sRWxlbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmNvbnRyb2xFbGVtO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdldEltYWdlQ29udGFpbmVyRWxlbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPcmlnRGltZW5zaW9ucyA9IGZ1bmN0aW9uKG9yaWdXaWR0aCwgb3JpZ0hlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub3JpZ1dpZHRoID0gb3JpZ1dpZHRoO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUub3JpZ0hlaWdodCA9IG9yaWdIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0T3JpZ0RpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAkc2NvcGUub3JpZ1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAkc2NvcGUub3JpZ0hlaWdodFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfV0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9