import type { Ref } from 'vue'
import { onBeforeUnmount } from 'vue'
import useOnAllRendered from './useOnAllRendered'
import { useCommandPalette } from '/@/store/app/commandPalette'
import type { MessageId } from '/@/types/entity-ids'

const useKeepScrollPosition = (
  ele: Ref<HTMLElement | null>,
  list: Ref<MessageId[]>
) => {
  const { currentScrollTop } = useCommandPalette()
  const { didRender, onAllRendered } = useOnAllRendered(list)

  // 開くときにマークダウンが描画しおえたらスクロール位置を適用
  onAllRendered(() => {
    if (ele.value) {
      ele.value.scrollTop = currentScrollTop.value
    }
  })

  // 閉じるときにスクロール位置を保持
  onBeforeUnmount(() => {
    if (ele.value) {
      currentScrollTop.value = ele.value.scrollTop
    }
  })

  return { didRender }
}

export default useKeepScrollPosition
