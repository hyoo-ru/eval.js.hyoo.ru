namespace $.$$ {

	export class $hyoo_js_eval extends $.$hyoo_js_eval {
		
		@ $mol_mem
		code( next?: string ) {
			return this.$.$mol_state_arg.value( 'code', next ) ?? ''
		}
		
		@ $mol_mem
		run( next?: boolean ) {
			return this.$.$mol_state_arg.value( 'run', next?.valueOf && String( next ) ) === 'true'
		}
		
		submit() {
			this.run( true )
		}
		
		@ $mol_mem
		perf() {
			const sources = encodeURIComponent(JSON.stringify([ this.code() ]))
			return `https://perf.js.hyoo.ru/#!sources=${sources}`
		}
		
		@ $mol_mem
		pages() {
			return [
				this.Menu_page(),
				this.Code_page(),
				... this.run() ? [ this.Result_page() ] : [],
			]
		}
		
		@ $mol_mem
		bookmark_list( next?: string[] ) {
			return this.$.$mol_state_local.value( 'snippets', next ) ?? super.bookmark_list()
		}
		
		@ $mol_mem
		bookmark( next?: boolean ) {
			const prev = this.bookmark_list()
			const code = this.code()
			if( next === undefined ) {
				return prev.includes( code )
			} else {
				const list = prev.filter( str => str !== code )
				if( next ) list.unshift( code )
				this.bookmark_list( list )
				return next
			}
		}
		
		@ $mol_mem
		menu() {
			return this.bookmark_list().map( (_, index )=> this.Menu_link( index ) )
		}
		
		menu_link_code( index: number ) {
			return this.bookmark_list()[ index ]
		}
		
		@ $mol_mem_key
		menu_link_title( index: number ) {
			return this.bookmark_list()[ index ]
				.replace( /\n[\s\S]*/, '' )
				.replace( /^\/\/ +/, '' )
		}
		
		@ $mol_mem
		code_enhanced() {
			
			let code = this.code()
			
			code = code.replaceAll(
				/^([ \t]*)(?:const|var|let|class|function) +(\w+)/mig,
				( found, indent, name )=> `__spy__( "${indent}${name} =", ()=>[ ${name} ] );${found}`
			)
			
			return code
		}
		
		@ $mol_mem
		execute() {
			
			if( !this.run() ) return []
			
			this.code()
			this.result([])
			
			clearTimeout( this._defer_spy )
			this.spy_queue.length = 0
		
			const console = new Proxy( this.$.console, {
				get: ( target, field: keyof Console )=> {
					
					if( typeof target[ field ] !== 'function' ) return target[ field ]
					
					return ( ... args: any[] )=> {
						this.spy( `${String(field)}:`, ()=> [ ... args ] )
						return ( target[ field ] as any )( ... args )
					}
					
				}
			} )
			
			const __spy__ = this.spy.bind( this )
			
			let __res__: any[]
			
			try {
				__res__ = [ '=', eval( this.code_enhanced() ) ]
			} catch( error ) {
				__res__ = [ '=', error ]
			}
			
			__spy__( '=', ()=> __res__.slice(1) )
			this.spy_run()
			
			return __res__
		}
		
		@ $mol_mem
		error_pos() {
			
			const [ eq, val ] = this.execute()
			if(!( val instanceof Error )) return null
			
			const pos = val.stack!.match( /(?:<anonymous>| eval).*:(\d+:\d+)/ )
			if( !pos ) return null
			
			const [ line, col ] = pos[1].split( ':' ).map( Number )
			const row = this.Code().View().Row( line )
			
			const shift = this.code_enhanced().split('\n')[ line - 1 ]
				?.match( /^\w*__spy__\( .*?\);/ )?.[0]?.length ?? 0
			
			return row.find_pos( col - 1 - shift )
			
		}
		
		error_anchor() {
			return this.error_pos()?.token
		}
		
		@ $mol_mem
		error_offset() {
			const pos = this.error_pos()!
			return [ pos.offset / pos.token.haystack().length, 0 ]
		}
		
		error_message() {
			return this.execute()[1]?.message
		}
		
		Error_mark() {
			return this.run() ? super.Error_mark() : null as any
		}
		
		spy_queue = [] as [ string, ()=> any[] ][]
		
		_defer_spy: any = 0
		
		@ $mol_action
		spy_run() {
			if( !this.run() ) return
			this.result([
				... this.result(),
				... this.spy_queue.splice(0).map( ([ name, task ])=> {
					try {
						return ( [ name ] as any[] ).concat( task() )
					} catch( error ) {
						if( error instanceof ReferenceError ) {
							this.spy_queue.push([ name, task ])
							if( !this._defer_spy ) {
								this._defer_spy = setTimeout( ()=> {
									this._defer_spy = 0
									this.spy_run()
								}, 100 )
							}
						} else {
							return [ name, error ]
						}
					}
				} ).filter( Boolean ),
			])
		}
		
		spy( name: string, task: ()=> any[] ) {
			
			this.spy_queue.push([ name, task ])
			if( this.spy_queue.length > 1 ) return
			
			Promise.resolve().then( ()=> this.spy_run() )
			
		}

		@ $mol_mem
		result( next = [] as any[] ) {
			return next
		}
		
		@ $mol_mem
		rejection_listener() {
			return new $mol_dom_listener(
				window,
				'unhandledrejection',
				( event: PromiseRejectionEvent )=> {
					this.spy( 'Unhandled', ()=> event.reason )
				}
			)
		}
		
		@ $mol_mem
		logs() {
			this.rejection_listener()
			this.execute()
			return this.result().map( (_,index)=> this.Log( index ) )
		}
		
		@ $mol_mem_key
		log( index: number ) {
			return this.result()[ index ]
		}
		
		html( next = '' ) {
			const root = this.UI().dom_node() as HTMLElement
			root.innerHTML = next
			return new Proxy( ( query: string )=> root.querySelector( query ), {
				get: ( $, id: string )=> $( '#' + id ),
			} )
		}

	}
	
}
